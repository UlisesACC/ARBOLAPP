const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
  SELECT a.id_arbol, z.latitud, z.longitud, a.grosor_copa, a.altura, a.observaciones,
         e.id_especie, s.id_subespecie,
         e.nombre AS especie, s.nombre AS subespecie,
         encode(f.imagen, 'base64') AS foto_base64
  FROM Arboles a
  JOIN Zonas z ON a.id_zona = z.id_zona
  LEFT JOIN Especies e ON a.id_especie = e.id_especie
  LEFT JOIN Subespecies s ON a.id_subespecie = s.id_subespecie
  LEFT JOIN LATERAL (
    SELECT imagen
    FROM fotos_arbol
    WHERE id_arbol = a.id_arbol
    ORDER BY fecha_subida DESC
    LIMIT 1
  ) f ON true
`);


    res.render('mapa_arboles/mapa_arboles', { arboles: result.rows });
  } catch (err) {
    console.error("Error cargando árboles:", err);
    res.render('mapa_arboles/mapa_arboles', { arboles: [] });
  }
});

module.exports = router;
