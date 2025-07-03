const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/formulario_plagas', async (req, res) => {
    try {
        const arboles = await db.query(`
            SELECT 
                a.id_arbol, 
                a.id_arbol as numero_identificador, -- Usamos id_arbol como un identificador para mostrar
                e.nombre as nombre_especie
            FROM 
                Arboles a
            LEFT JOIN 
                Especies e ON a.id_especie = e.id_especie
            ORDER BY a.id_arbol
        `);
        
        res.render('formulario_plagas/plaga', { arboles: arboles.rows });
    } catch (err) {
        console.error('Error al cargar el formulario de plagas:', err);
        res.status(500).send('Error al cargar el formulario de plagas. Por favor, inténtalo de nuevo más tarde.');
    }
});

router.post('/registrar_plaga', async (req, res) => {
    try {
        const { arbol, plaga, nivel, fecha, tratamiento, observaciones_plaga } = req.body;

        await db.query(`
            INSERT INTO Plagas (id_arbol, tipo_plaga, nivel_afectacion, fecha_deteccion, tratamiento_aplicado, observaciones_adicionales)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [arbol, plaga, nivel, fecha, tratamiento, observaciones_plaga]);

        res.redirect('/plagas/formulario_plagas?success=true');
    } catch (err) {
        console.error('Error al registrar la plaga:', err);
        res.status(500).send('Error al registrar la plaga. Por favor, verifica los datos e inténtalo de nuevo.');
    }
});

router.get('/lista_plagas', async (req, res) => {
    try {
        const plagas = await db.query(`
            SELECT 
                p.id_plaga, 
                p.tipo_plaga, 
                p.nivel_afectacion, 
                p.fecha_deteccion, 
                p.tratamiento_aplicado,
                p.observaciones_adicionales,
                a.id_arbol as numero_arbol,
                e.nombre as nombre_especie,
                s.nombre as nombre_subespecie,
                z.alcaldia,
                z.colonia,
                ARRAY_AGG(encode(fp.imagen, 'base64') ORDER BY fp.fecha_subida DESC) FILTER (WHERE fp.imagen IS NOT NULL) AS fotos_base64_plaga
                -- ^^^ NUEVA LÍNEA: Agrega las fotos de la plaga
            FROM 
                Plagas p
            JOIN 
                Arboles a ON p.id_arbol = a.id_arbol
            LEFT JOIN 
                Especies e ON a.id_especie = e.id_especie
            LEFT JOIN 
                Subespecies s ON a.id_subespecie = s.id_subespecie
            LEFT JOIN 
                Zonas z ON a.id_zona = z.id_zona
            LEFT JOIN 
                fotos_plaga fp ON fp.id_plaga = p.id_plaga -- ^^^ NUEVA LÍNEA: JOIN a la tabla de fotos de plaga
            GROUP BY 
                p.id_plaga, a.id_arbol, e.nombre, s.nombre, z.alcaldia, z.colonia
            ORDER BY 
                p.fecha_deteccion DESC, a.id_arbol ASC
        `);

        res.render('formulario_plagas/lista_plagas', { plagas: plagas.rows });
    } catch (err) {
        console.error('Error al listar plagas:', err);
        res.status(500).send('Error al listar plagas. Por favor, inténtalo de nuevo más tarde.');
    }
});

module.exports = router;
