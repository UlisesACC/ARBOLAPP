//controller de agregar especies
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

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

    let query, params;
    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      query = `
        UPDATE Especies
        SET nombre = $1, descripcion = $2, fotografia = $3
        WHERE id_especie = $4
      `;
      params = [nombre, descripcion, buffer, id];
    } else {
      query = `
        UPDATE Especies
        SET nombre = $1, descripcion = $2
        WHERE id_especie = $3
      `;
      params = [nombre, descripcion, id];
    }

    await db.query(query, params);
    res.redirect('/especies/lista_especies');
  } catch (err) {
    console.error('Error modificando especie:', err);
    res.status(500).send('Error modificando especie');
  }
});

// Guardar nueva especie
router.post('/nueva_especie', upload.single('fotografia'), async (req, res) => {
  try {
    const { nombre, id_forma_hoja, id_forma_flor, id_origen, descripcion } = req.body;

    let fotografiaBuffer = null;
    if (req.file) {
      fotografiaBuffer = fs.readFileSync(req.file.path);
    }

    await db.query(`
      INSERT INTO Especies (nombre, id_forma_hoja, id_forma_flor, id_origen, fotografia, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [nombre, id_forma_hoja || null, id_forma_flor || null, id_origen || null, fotografiaBuffer, descripcion]);

    res.redirect('/especies/lista_especies');
  } catch (err) {
    console.error('Error registrando especie:', err);
    res.status(500).send('Error registrando especie');
  }
});

module.exports = router;
