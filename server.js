require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
// nueva especie
app.get('/nueva_especie', async (req, res) => {
  try {
    const hojasResult = await db.query('SELECT * FROM DescripcionesFormaHoja ORDER BY forma_hoja');
    const floresResult = await db.query('SELECT * FROM DescripcionesFormaFlor ORDER BY forma_flor');
    const origenesResult = await db.query('SELECT * FROM DescripcionesOrigen ORDER BY origen');

    res.render('agregar_especies/new_especies', {
      hojas: hojasResult.rows,
      flores: floresResult.rows,
      origenes: origenesResult.rows
    });
  } catch (err) {
    console.error('Error cargando opciones:', err);
    res.status(500).send('Error cargando formulario');
  }
});

//formulario de arbol
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
//mostrando los arboles
// Mostrar lista de árboles
app.get('/lista_arboles', async (req, res) => {
  try {
    const arbolesResult = await db.query(`
      SELECT 
        a.id_arbol, 
        e.nombre AS nombre_especie, 
        s.nombre AS nombre_subespecie,
        z.alcaldia,
        z.colonia,
        a.grosor_tronco,
        a.altura,
        a.grosor_copa,
        a.observaciones
      FROM Arboles a
      LEFT JOIN Especies e ON a.id_especie = e.id_especie
      LEFT JOIN Subespecies s ON a.id_subespecie = s.id_subespecie
      LEFT JOIN Zonas z ON a.id_zona = z.id_zona
      ORDER BY a.id_arbol
    `);

    res.render('formulario_arbol/lista_arbol', { arboles: arbolesResult.rows });
  } catch (err) {
    console.error('Error cargando lista de árboles:', err);
    res.status(500).send('Error cargando árboles');
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
// para ver y modificar especies
// Mostrar lista de especies
app.get('/lista_especies', async (req, res) => {
  try {
    const especiesResult = await db.query(`
      SELECT id_especie, nombre, fotografia, descripcion
      FROM Especies
      ORDER BY nombre
    `);
    res.render('agregar_especies/lista_especies', { especies: especiesResult.rows });
  } catch (err) {
    console.error('Error cargando lista de especies:', err);
    res.status(500).send('Error cargando especies');
  }
});

// Eliminar una especie
app.post('/eliminar_especie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Especies WHERE id_especie = $1', [id]);
    res.redirect('/lista_especies');
  } catch (err) {
    console.error('Error eliminando especie:', err);
    res.status(500).send('Error eliminando especie');
  }
});
//modificar especies
// Mostrar el formulario para modificar especie
app.get('/modificar_especie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const especieResult = await db.query('SELECT * FROM Especies WHERE id_especie = $1', [id]);
    if (especieResult.rows.length === 0) {
      return res.status(404).send('Especie no encontrada');
    }
    res.render('agregar_especies/modificar_especie', { especie: especieResult.rows[0] });
  } catch (err) {
    console.error('Error mostrando especie para modificar:', err);
    res.status(500).send('Error cargando especie');
  }
});

// Guardar cambios de la especie
app.post('/modificar_especie/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    if (fotografia) {
      // Si subió nueva foto
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2, fotografia = $3
        WHERE id_especie = $4
      `, [nombre, descripcion, fotografia, id]);
    } else {
      // Si no subió foto nueva
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2
        WHERE id_especie = $3
      `, [nombre, descripcion, id]);
    }

    res.redirect('/lista_especies');
  } catch (err) {
    console.error('Error actualizando especie:', err);
    res.status(500).send('Error actualizando especie');
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
//post para guardar la nueva especie
app.post('/nueva_especie', upload.single('fotografia'), async (req, res) => {
  try {
    const { nombre, id_forma_hoja, id_forma_flor, id_origen, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    // Solo uno de los tres debe ir
    let formaHoja = null;
    let formaFlor = null;
    let origen = null;

    if (id_forma_hoja) {
      formaHoja = id_forma_hoja;
    } else if (id_forma_flor) {
      formaFlor = id_forma_flor;
    } else if (id_origen) {
      origen = id_origen;
    }

    await db.query(`
      INSERT INTO Especies (nombre, id_forma_hoja, id_forma_flor, id_origen, fotografia, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [nombre, formaHoja, formaFlor, origen, fotografia, descripcion]);

    res.redirect('/');
  } catch (err) {
    console.error('Error registrando especie:', err);
    res.status(500).send('Error registrando especie');
  }
});
// para las subespecies
// Mostrar el formulario para nueva subespecie
app.get('/nueva_subespecie', async (req, res) => {
  try {
    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');
    res.render('subespecies/new_subespecies', { especies: especiesResult.rows });
  } catch (err) {
    console.error('Error cargando formulario de subespecies:', err);
    res.status(500).send('Error cargando formulario');
  }
});

// Guardar nueva subespecie
app.post('/nueva_subespecie', async (req, res) => {
  try {
    const { id_especie, nombre_subespecie } = req.body;

    await db.query(`
      INSERT INTO Subespecies (id_especie, nombre)
      VALUES ($1, $2)
    `, [id_especie, nombre_subespecie]);

    res.redirect('/nueva_subespecie'); // Redirigir a la misma página o a donde tú prefieras
  } catch (err) {
    console.error('Error registrando subespecie:', err);
    res.status(500).send('Error registrando subespecie');
  }
});
//Eliminar y modificar subespecies
// Mostrar lista de subespecies
app.get('/lista_subespecies', async (req, res) => {
  try {
    const subespeciesResult = await db.query(`
      SELECT s.id_subespecie, s.nombre AS nombre_subespecie, e.nombre AS nombre_especie
      FROM Subespecies s
      JOIN Especies e ON s.id_especie = e.id_especie
      ORDER BY e.nombre, s.nombre
    `);
    res.render('subespecies/lista_subespecies', { subespecies: subespeciesResult.rows });
  } catch (err) {
    console.error('Error cargando lista de subespecies:', err);
    res.status(500).send('Error cargando subespecies');
  }
});

// Eliminar subespecie
app.post('/eliminar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Subespecies WHERE id_subespecie = $1', [id]);
    res.redirect('/lista_subespecies');
  } catch (err) {
    console.error('Error eliminando subespecie:', err);
    res.status(500).send('Error eliminando subespecie');
  }
});
// Mostrar formulario para modificar subespecie
app.get('/modificar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subespecieResult = await db.query(`
      SELECT s.id_subespecie, s.nombre AS nombre_subespecie, e.id_especie, e.nombre AS nombre_especie
      FROM Subespecies s
      JOIN Especies e ON s.id_especie = e.id_especie
      WHERE id_subespecie = $1
    `, [id]);

    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');

    if (subespecieResult.rows.length === 0) {
      return res.status(404).send('Subespecie no encontrada');
    }

    res.render('subespecies/modificar_subespecie', { 
      subespecie: subespecieResult.rows[0],
      especies: especiesResult.rows
    });
  } catch (err) {
    console.error('Error mostrando subespecie para modificar:', err);
    res.status(500).send('Error cargando subespecie');
  }
});

// Guardar cambios de la subespecie
app.post('/modificar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_especie, nombre_subespecie } = req.body;

    await db.query(`
      UPDATE Subespecies
      SET id_especie = $1, nombre = $2
      WHERE id_subespecie = $3
    `, [id_especie, nombre_subespecie, id]);

    res.redirect('/lista_subespecies');
  } catch (err) {
    console.error('Error actualizando subespecie:', err);
    res.status(500).send('Error actualizando subespecie');
  }
});
//eliminando arbol y modificandolo
// Eliminar un árbol 
app.post('/eliminar_arbol/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Arboles WHERE id_arbol = $1', [id]);
    res.redirect('/lista_arboles');
  } catch (err) {
    console.error('Error eliminando árbol:', err);
    res.status(500).send('Error eliminando árbol');
  }
});

// Mostrar formulario para modificar árbol
app.get('/modificar_arbol/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const arbolResult = await db.query('SELECT * FROM Arboles WHERE id_arbol = $1', [id]);
    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');
    const subespeciesResult = await db.query('SELECT id_subespecie, nombre FROM Subespecies ORDER BY nombre');

    if (arbolResult.rows.length === 0) {
      return res.status(404).send('Árbol no encontrado');
    }

    res.render('formulario_arbol/modificar_arbol', {
      arbol: arbolResult.rows[0],
      especies: especiesResult.rows,
      subespecies: subespeciesResult.rows
    });
  } catch (err) {
    console.error('Error cargando árbol:', err);
    res.status(500).send('Error cargando árbol');
  }
});

// Guardar cambios de un árbol
app.post('/modificar_arbol/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { id_especie, id_subespecie, grosor_tronco, altura, grosor_copa, observaciones } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    if (fotografia) {
      // Si subió nueva foto, actualizamos también la fotografía
      await db.query(`
        UPDATE Arboles
        SET id_especie = $1, id_subespecie = $2, grosor_tronco = $3, altura = $4, grosor_copa = $5, observaciones = $6, fotografia = $7
        WHERE id_arbol = $8
      `, [id_especie, id_subespecie, grosor_tronco || null, altura || null, grosor_copa || null, observaciones, fotografia, id]);
    } else {
      // Si no subió nueva foto, no cambiamos la fotografía
      await db.query(`
        UPDATE Arboles
        SET id_especie = $1, id_subespecie = $2, grosor_tronco = $3, altura = $4, grosor_copa = $5, observaciones = $6
        WHERE id_arbol = $7
      `, [id_especie, id_subespecie, grosor_tronco || null, altura || null, grosor_copa || null, observaciones, id]);
    }

    res.redirect('/lista_arboles');
  } catch (err) {
    console.error('Error actualizando árbol:', err);
    res.status(500).send('Error actualizando árbol');
  }
});



// iniciando el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
