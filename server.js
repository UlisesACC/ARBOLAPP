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

// NO pongas conesctarDB(); aquí
// porque wait-for-postgres.js ya se encarga de eso

// configuraciones Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src'));

// rutas
app.get('/', (req, res) => {
  res.render('inicio/index');
});

app.get('/formulario', async (req, res) => {
  try {
    const especiesResult = await db.query('SELECT * FROM Especies ORDER BY nombre');
    res.render('formulario_arbol/arbol', { especies: especiesResult.rows });
  } catch (err) {
    console.error('Error cargando especies:', err);
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

// iniciando el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
