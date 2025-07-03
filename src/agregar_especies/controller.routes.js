const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nueva_especie', async (req, res) => {
  try {
    const hojasResult = await db.query('SELECT * FROM DescripcionesFormaHoja ORDER BY forma_hoja');
    const floresResult = await db.query('SELECT * FROM DescripcionesFormaFlor ORDER BY forma_flor');
    const origenesResult = await db.query('SELECT * FROM DescripcionesOrigen ORDER BY origen');

    const hojas = hojasResult.rows.map(row => ({
      ...row,
      fotografia_base64: row.fotografia ? row.fotografia.toString('base64') : null
    }));

    const flores = floresResult.rows.map(row => ({
      ...row,
      fotografia_base64: row.fotografia ? row.fotografia.toString('base64') : null
    }));

    const origenes = origenesResult.rows.map(row => ({
      ...row,
      fotografia_base64: row.fotografia ? row.fotografia.toString('base64') : null
    }));

    res.render('agregar_especies/new_especies', {
      hojas,
      flores,
      origenes
    });
  } catch (err) {
    console.error('Error cargando opciones:', err);
    res.status(500).send('Error cargando formulario');
  }
});

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

router.post('/modificar_especie/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    let query, params;
    if (req.file) {
      const buffer = req.file.buffer;
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

router.post('/nueva_especie', upload.single('fotografia'), async (req, res) => {
  try {
    const { nombre, id_forma_hoja, id_forma_flor, id_origen, descripcion } = req.body;

    let fotografiaBuffer = null;
    if (req.file) {
      fotografiaBuffer = req.file.buffer;
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


router.post('/subir_hoja', upload.single('fotografia'), async (req, res) => {
  try {
    const { forma_hoja, descripcion } = req.body;
    const fotografia = req.file ? req.file.buffer : null;

    await db.query(`
      INSERT INTO DescripcionesFormaHoja (forma_hoja, descripcion, fotografia)
      VALUES ($1, $2, $3)
    `, [forma_hoja, descripcion, fotografia]);

    res.redirect('/especies/nueva_especie');
  } catch (err) {
    console.error('Error registrando forma hoja:', err);
    res.status(500).send('Error registrando hoja');
  }
});

router.post('/subir_flor', upload.single('fotografia'), async (req, res) => {
  try {
    const { forma_flor, descripcion } = req.body;
    const fotografia = req.file ? req.file.buffer : null;

    await db.query(`
      INSERT INTO DescripcionesFormaFlor (forma_flor, descripcion, fotografia)
      VALUES ($1, $2, $3)
    `, [forma_flor, descripcion, fotografia]);

    res.redirect('/especies/nueva_especie');
  } catch (err) {
    console.error('Error registrando forma flor:', err);
    res.status(500).send('Error registrando flor');
  }
});

router.post('/subir_origen', upload.single('fotografia'), async (req, res) => {
  try {
    const { origen, descripcion } = req.body;
    const fotografia = req.file ? req.file.buffer : null;

    await db.query(`
      INSERT INTO DescripcionesOrigen (origen, descripcion, fotografia)
      VALUES ($1, $2, $3)
    `, [origen, descripcion, fotografia]);

    res.redirect('/especies/nueva_especie');
  } catch (err) {
    console.error('Error registrando origen:', err);
    res.status(500).send('Error registrando origen');
  }
});

module.exports = router;
