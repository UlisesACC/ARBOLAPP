const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // almacenamiento en memoria
const fs = require('fs');

// Mostrar formulario de registro
router.get('/formulario', async (req, res) => {
  try {
    const especies = await db.query('SELECT * FROM Especies ORDER BY nombre');
    const zonas = await db.query('SELECT * FROM Zonas ORDER BY alcaldia, colonia');
    res.render('formulario_arbol/arbol', { especies: especies.rows, zonas: zonas.rows });
  } catch (err) {
    console.error('Error al cargar el formulario:', err);
    res.status(500).send('Error al cargar formulario');
  }
});

// Registrar árbol y múltiples fotos
router.post('/registrar_arbol', upload.array('fotografias'), async (req, res) => {
  try {
    const {
      numero_arbol, especie, subespecie, latitud, longitud,
      alcaldia, colonia, calle, numero, codigo_postal,
      grosor_tronco, altura, grosor_copa, observaciones
    } = req.body;

    // Verificar o insertar zona
    let id_zona;
    const zonaExistente = await db.query(
      `SELECT id_zona FROM Zonas WHERE alcaldia = $1 AND colonia = $2 AND calle = $3 AND numero = $4 AND codigo_postal = $5`,
      [alcaldia, colonia, calle, numero, codigo_postal]
    );
    if (zonaExistente.rows.length > 0) {
      id_zona = zonaExistente.rows[0].id_zona;
    } else {
      const nuevaZona = await db.query(
        `INSERT INTO Zonas (alcaldia, colonia, calle, numero, codigo_postal, latitud, longitud) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_zona`,
        [alcaldia, colonia, calle, numero, codigo_postal, latitud || null, longitud || null]
      );
      id_zona = nuevaZona.rows[0].id_zona;
    }

    // Insertar árbol
    await db.query(`
      INSERT INTO Arboles (id_arbol, id_especie, id_subespecie, id_zona, grosor_tronco, altura, grosor_copa, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [numero_arbol, especie, subespecie, id_zona, grosor_tronco || null, altura || null, grosor_copa || null, observaciones]);

    // Insertar fotos (si existen)
    if (req.files?.length > 0) {
      for (const file of req.files) {
        await db.query(`
          INSERT INTO fotos_arbol (id_arbol, imagen, descripcion)
          VALUES ($1, $2, $3)
        `, [numero_arbol, file.buffer, 'Foto subida']);
      }
    }

    res.redirect('/arboles/formulario');
  } catch (err) {
    console.error('Error registrando árbol:', err);
    res.status(500).send('Error registrando árbol');
  }
});

// Listar árboles con su foto más reciente
// Listar árboles con todas sus fotos
router.get('/lista_arboles', async (req, res) => {
  try {
    const arboles = await db.query(`
      SELECT a.id_arbol, e.nombre AS nombre_especie, s.nombre AS nombre_subespecie,
             z.alcaldia, z.colonia, a.grosor_tronco, a.altura, a.grosor_copa, a.observaciones,
             ARRAY_AGG(encode(fa.imagen, 'base64') ORDER BY fa.fecha_subida DESC) AS fotos_base64
      FROM Arboles a
      LEFT JOIN Especies e ON a.id_especie = e.id_especie
      LEFT JOIN Subespecies s ON a.id_subespecie = s.id_subespecie
      LEFT JOIN Zonas z ON a.id_zona = z.id_zona
      LEFT JOIN fotos_arbol fa ON fa.id_arbol = a.id_arbol
      GROUP BY a.id_arbol, e.nombre, s.nombre, z.alcaldia, z.colonia, a.grosor_tronco, a.altura, a.grosor_copa, a.observaciones
      ORDER BY a.id_arbol
    `);

    res.render('formulario_arbol/lista_arbol', { arboles: arboles.rows });
  } catch (err) {
    console.error('Error al listar árboles:', err);
    res.status(500).send('Error al listar árboles');
  }
});


// Modificar árbol
router.get('/modificar_arbol/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const arbolResult = await db.query('SELECT * FROM Arboles WHERE id_arbol = $1', [id]);
    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');
    const subespeciesResult = await db.query('SELECT id_subespecie, nombre FROM Subespecies ORDER BY nombre');
    const fotosResult = await db.query(`
      SELECT id_foto, encode(imagen, 'base64') AS foto_base64
      FROM fotos_arbol
      WHERE id_arbol = $1
      ORDER BY fecha_subida DESC
    `, [id]);

    if (arbolResult.rows.length === 0) {
      return res.status(404).send('Árbol no encontrado');
    }

    res.render('formulario_arbol/modificar_arbol', {
      arbol: arbolResult.rows[0],
      especies: especiesResult.rows,
      subespecies: subespeciesResult.rows,
      fotos: fotosResult.rows
    });
  } catch (err) {
    console.error('Error cargando árbol:', err);
    res.status(500).send('Error cargando árbol');
  }
});


// Guardar cambios y agregar fotos nuevas
router.post('/modificar_arbol/:id', upload.array('fotografias'), async (req, res) => {
  try {
    const { id } = req.params;
    const { id_especie, id_subespecie, grosor_tronco, altura, grosor_copa, observaciones } = req.body;

    await db.query(`
      UPDATE Arboles
      SET id_especie = $1, id_subespecie = $2, grosor_tronco = $3, altura = $4,
          grosor_copa = $5, observaciones = $6
      WHERE id_arbol = $7
    `, [id_especie, id_subespecie, grosor_tronco || null, altura || null, grosor_copa || null, observaciones, id]);

    if (req.files?.length > 0) {
      for (const file of req.files) {
        await db.query(`
          INSERT INTO fotos_arbol (id_arbol, imagen, descripcion)
          VALUES ($1, $2, $3)
        `, [id, file.buffer, 'Foto nueva']);
      }
    }

    res.redirect('/arboles/lista_arboles');
  } catch (err) {
    console.error('Error modificando árbol:', err);
    res.status(500).send('Error modificando árbol');
  }
});

// Eliminar árbol
router.post('/eliminar_arbol/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Arboles WHERE id_arbol = $1', [id]);
    res.redirect('/arboles/lista_arboles');
  } catch (err) {
    console.error('Error eliminando árbol:', err);
    res.status(500).send('Error eliminando árbol');
  }
});

// Eliminar una foto individual
router.post('/eliminar_foto/:id_foto', async (req, res) => {
  try {
    const { id_foto } = req.params;
    // Obtener el id_arbol para redirigir correctamente
    const foto = await db.query('SELECT id_arbol FROM fotos_arbol WHERE id_foto = $1', [id_foto]);
    if (foto.rows.length === 0) return res.status(404).send('Foto no encontrada');

    const id_arbol = foto.rows[0].id_arbol;
    await db.query('DELETE FROM fotos_arbol WHERE id_foto = $1', [id_foto]);
    res.redirect(`/arboles/modificar_arbol/${id_arbol}`);
  } catch (err) {
    console.error('Error eliminando foto:', err);
    res.status(500).send('Error eliminando foto');
  }
});

module.exports = router;
