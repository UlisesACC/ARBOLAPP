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

// iniciando el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
//haciendo uso de los controllers
app.use('/', require('./src/inicio/controller.routes'));