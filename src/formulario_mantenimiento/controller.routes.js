const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Aquí multer guarda temporalmente los archivos

// Redireccionar al formulario de mantenimiento
router.get('/formulario', async (req, res) => {
  try {

    res.render('formulario_mantenimiento/mantenimiento');

  } catch (err) {
    console.error('Error cargando formulario:', err);
    res.status(500).send('Error cargando formulario');
  }
});

// Guardar datos del mantenimiento de un arbol
router.post(
  '/registrar_mantenimiento',
  upload.fields([
    { name: 'foto_antes', maxCount: 1 },
    { name: 'foto_despues', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        fecha,
        tipo_intervencion,
        tipo_intervencion_detalle, // ⚠️ campo del formulario
        causa_intervencion,        // ⚠️ campo del formulario
        destino_material,
        ubicacion_original,
        nueva_ubicacion,
        exito_trasplante,
        descripcion,
        responsable,
        observaciones
      } = req.body;

      const fotoAntes = req.files['foto_antes'] ? req.files['foto_antes'][0].filename : null;
      const fotoDespues = req.files['foto_despues'] ? req.files['foto_despues'][0].filename : null;


      await db.query(`
        INSERT INTO Mantenimientos (
          tipo_intervencion,
          tipo_detalle,
          causa_detalle,
          fecha,
          destino_material,
          ubicacion_original,
          nueva_ubicacion,
          exito_trasplante,
          descripcion,
          responsable,
          observaciones,
          foto_antes,
          foto_despues
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `, [
        tipo_intervencion,
        tipo_intervencion_detalle || null,
        causa_intervencion || null,
        fecha || null,
        destino_material || null,
        ubicacion_original || null,
        nueva_ubicacion || null,
        exito_trasplante || null,
        descripcion,
        responsable,
        observaciones || null,
        fotoAntes,
        fotoDespues
      ]);

      res.redirect('/mantenimiento/formulario');
    } catch (err) {
      console.error('❌ Error registrando mantenimiento:', err);
      res.status(500).send('Error registrando mantenimiento');
    }
  }
);



// Listar todos los mantenimientos que hay 
router.get('/lista', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Mantenimientos ORDER BY fecha DESC');
    res.render('formulario_mantenimiento/lista_mantenimientos', { mantenimientos: result.rows });
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    res.status(500).send('Error al obtener los mantenimientos');
  }
});

module.exports = router;