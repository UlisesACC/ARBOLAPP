require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require("path");
const port = process.env.PORT || 3000;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// configuraciones Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src'));

// iniciando el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
//haciendo uso de los controllers
app.use('/', require('./src/inicio/controller.routes'));
app.use('/especies', require('./src/agregar_especies/controller.routes'));
app.use('/arboles', require('./src/formulario_arbol/controller.routes'));
app.use('/plagas', require('./src/plagas/controller.routes'));
app.use('/subespecies', require('./src/subespecies/controller.routes'));
app.use('/mantenimiento', require('./src/formulario_mantenimiento/controller.routes'));