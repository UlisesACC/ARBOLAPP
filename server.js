require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const { Pool } = require("pg");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});


// configuraciones Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src'));

// rutas
app.get('/', (req, res) => {
  res.render('inicio/index');
});

app.get('/nueva_especie', (req, res) => {
  res.render('agregar_especies/new_especies');
});

app.get('/formulario', async (req, res) => {
  try {
    const especiesResult = await db.query('SELECT * FROM Especies ORDER BY nombre');
    const zonasResult = await db.query('SELECT * FROM Zonas ORDER BY alcaldia, colonia');

    res.render('formulario_arbol/arbol', { 
      especies: especiesResult.rows, 
      zonas: zonasResult.rows
    });
  } catch (err) {
    console.error('Error cargando formulario:', err);
    res.status(500).send('Error cargando formulario');
  }
});

app.get('/subespecies/:id_especie', async (req, res) => {
  try {
    const { id_especie } = req.params;
    const subespeciesResult = await db.query('SELECT * FROM Subespecies WHERE id_especie = $1', [id_especie]);
    res.json(subespeciesResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar subespecies');
  }
});

//Registrando el arbol 
app.post('/registrar_arbol', upload.single('fotografia'), async (req, res) => {
  try {
    const {
      numero_arbol,
      especie,
      subespecie,
      latitud,
      longitud,
      alcaldia,
      colonia,
      calle,
      numero,
      codigo_postal,
      grosor_tronco,
      altura,
      grosor_copa,
      observaciones
    } = req.body;

    const fotografia = req.file ? req.file.path : null; // path de la foto si sube

    let id_zona;

    // Buscar zona existente
    const zonaExistente = await db.query(
      `SELECT id_zona FROM Zonas 
       WHERE alcaldia = $1 AND colonia = $2 AND calle = $3 AND numero = $4 AND codigo_postal = $5`,
      [alcaldia, colonia, calle, numero, codigo_postal]
    );

    if (zonaExistente.rows.length > 0) {
      id_zona = zonaExistente.rows[0].id_zona;
    } else {
      // Insertar nueva zona
      const nuevaZona = await db.query(
        `INSERT INTO Zonas (alcaldia, colonia, calle, numero, codigo_postal, latitud, longitud) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_zona`,
        [alcaldia, colonia, calle, numero, codigo_postal, latitud || null, longitud || null]
      );
      id_zona = nuevaZona.rows[0].id_zona;
    }

    // Insertar árbol completo
    await db.query(
      `INSERT INTO Arboles 
       (id_arbol, id_especie, id_subespecie, id_zona, grosor_tronco, altura, grosor_copa, fotografia, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [numero_arbol, especie, subespecie, id_zona, grosor_tronco || null, altura || null, grosor_copa || null, fotografia, observaciones]
    );

    res.redirect('/formulario');
  } catch (err) {
    console.error('Error registrando árbol:', err);
    res.status(500).send('Error registrando árbol');
  }
});

// iniciando el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
