require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const {Pool} = require("pg");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const db = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});
//iniciando el servidor
app.listen(port,()=>{
  console.log(`Servidor corriendo en http://localhost:${port}`);
})
//configurando ejs como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src'));
//conectando a la base de datos 
async function conesctarDB(reintentos =5){
  while(reintentos){
    try{
      await db.connect();
      console.log('🟢 Conectando a Postgreql');
      return db;
    } catch(err){
      console.log(`🔁 Reintentando conexión a PostgreSQL... (${5 - reintentos + 1})`);
      reintentos--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  console.error('🔴 No se pudo conectar a PostgreSQL. Despues de varios intentos');
  process.exit(1);
}
//renderizando formulario de arbol
app.get('/formulario', (req, res) => {
  res.render('formulaario_arbol/arbol');
});
//renderizando la ruta principal
app.get('/', async (req, res) => {
  res.render('inicio/index');
});
//Consulta para arboles

// Ruta para registrar un nuevo árbol
/*
app.post('/registrar', upload.single('fotografia'), async (req, res) => {
  const { id_arbol, id_especie, id_subespecie, id_zona, grosor_tronco, altura, angulo_inclinacion, estado_raices, estado_follaje, ultima_inspeccion, observaciones} = req.body;
  const fotografia = req.file ? req.file.path : null; 
  try{
    const arbolesResult = await db.query(
      'ISERT INTO arboles '
    )
  }
});
*/
