const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // Paso 1: Traer árboles con su información
    const arbolesRes = await db.query(`
      SELECT a.id_arbol, z.latitud, z.longitud, a.grosor_copa, a.altura, a.observaciones,
             a.grosor_tronco, a.ultima_inspeccion,
             e.id_especie, s.id_subespecie,
             e.nombre AS especie, s.nombre AS subespecie
      FROM Arboles a
      JOIN Zonas z ON a.id_zona = z.id_zona
      LEFT JOIN Especies e ON a.id_especie = e.id_especie
      LEFT JOIN Subespecies s ON a.id_subespecie = s.id_subespecie
    `);

    const arboles = arbolesRes.rows;

    // Paso 2: Traer todas las fotos
    const fotosRes = await db.query(`
      SELECT id_arbol, encode(imagen, 'base64') AS imagen_base64
      FROM fotos_arbol
      ORDER BY fecha_subida ASC
    `);

    // Paso 3: Agrupar fotos por árbol
    const fotosPorArbol = {};
    fotosRes.rows.forEach(f => {
      if (!fotosPorArbol[f.id_arbol]) fotosPorArbol[f.id_arbol] = [];
      fotosPorArbol[f.id_arbol].push(f.imagen_base64);
    });

    // Paso 4: Añadir arreglo de fotos a cada árbol
    arboles.forEach(a => {
      a.fotos = fotosPorArbol[a.id_arbol] || [];
    });

    res.render('mapa_arboles/mapa_arboles', { arboles });
  } catch (err) {
    console.error("Error cargando árboles:", err);
    res.render('mapa_arboles/mapa_arboles', { arboles: [] });
  }
});

module.exports = router;
