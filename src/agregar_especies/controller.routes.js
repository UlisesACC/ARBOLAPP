const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Nueva especie - Formulario
router.get('/nueva_especie', async (req, res) => {
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

// Lista de especies
router.get('/lista_especies', async (req, res) => {
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

// Eliminar especie
router.post('/eliminar_especie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Especies WHERE id_especie = $1', [id]);
    res.redirect('/especies/lista_especies');
  } catch (err) {
    console.error('Error eliminando especie:', err);
    res.status(500).send('Error eliminando especie');
  }
});

// Formulario para modificar especie
router.get('/modificar_especie/:id', async (req, res) => {
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

// Guardar cambios de especie
router.post('/modificar_especie/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    if (fotografia) {
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2, fotografia = $3
        WHERE id_especie = $4
      `, [nombre, descripcion, fotografia, id]);
    } else {
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2
        WHERE id_especie = $3
      `, [nombre, descripcion, id]);
    }

    res.redirect('/especies/lista_especies');
  } catch (err) {
    console.error('Error actualizando especie:', err);
    res.status(500).send('Error actualizando especie');
  }
});

// Guardar nueva especie
router.post('/nueva_especie', upload.single('fotografia'), async (req, res) => {
  try {
    const { nombre, id_forma_hoja, id_forma_flor, id_origen, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    let formaHoja = id_forma_hoja || null;
    let formaFlor = id_forma_flor || null;
    let origen = id_origen || null;

    await db.query(`
      INSERT INTO Especies (nombre, id_forma_hoja, id_forma_flor, id_origen, fotografia, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [nombre, formaHoja, formaFlor, origen, fotografia, descripcion]);

    res.redirect('/especies/lista_especies');
  } catch (err) {
    console.error('Error registrando especie:', err);
    res.status(500).send('Error registrando especie');
  }
});

module.exports = router;
