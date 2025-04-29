const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// formulario de árbol
router.get('/formulario', async (req, res) => {
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

// mostrar lista de árboles
router.get('/lista_arboles', async (req, res) => {
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

// registrar árbol
router.post('/registrar_arbol', upload.single('fotografia'), async (req, res) => {
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

    const fotografia = req.file ? req.file.path : null;

    let id_zona;

    const zonaExistente = await db.query(
      `SELECT id_zona FROM Zonas 
       WHERE alcaldia = $1 AND colonia = $2 AND calle = $3 AND numero = $4 AND codigo_postal = $5`,
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

    await db.query(
      `INSERT INTO Arboles 
       (id_arbol, id_especie, id_subespecie, id_zona, grosor_tronco, altura, grosor_copa, fotografia, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [numero_arbol, especie, subespecie, id_zona, grosor_tronco || null, altura || null, grosor_copa || null, fotografia, observaciones]
    );

    res.redirect('/arboles/formulario');
  } catch (err) {
    console.error('Error registrando árbol:', err);
    res.status(500).send('Error registrando árbol');
  }
});

// eliminar árbol
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

// mostrar formulario de modificación
router.get('/modificar_arbol/:id', async (req, res) => {
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

// guardar cambios
router.post('/modificar_arbol/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { id_especie, id_subespecie, grosor_tronco, altura, grosor_copa, observaciones } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    if (fotografia) {
      await db.query(`
        UPDATE Arboles
        SET id_especie = $1, id_subespecie = $2, grosor_tronco = $3, altura = $4, grosor_copa = $5, observaciones = $6, fotografia = $7
        WHERE id_arbol = $8
      `, [id_especie, id_subespecie, grosor_tronco || null, altura || null, grosor_copa || null, observaciones, fotografia, id]);
    } else {
      await db.query(`
        UPDATE Arboles
        SET id_especie = $1, id_subespecie = $2, grosor_tronco = $3, altura = $4, grosor_copa = $5, observaciones = $6
        WHERE id_arbol = $7
      `, [id_especie, id_subespecie, grosor_tronco || null, altura || null, grosor_copa || null, observaciones, id]);
    }

    res.redirect('/arboles/lista_arboles');
  } catch (err) {
    console.error('Error actualizando árbol:', err);
    res.status(500).send('Error actualizando árbol');
  }
});

module.exports = router;
