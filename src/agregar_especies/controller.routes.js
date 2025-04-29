// nueva especie
app.get('/nueva_especie', async (req, res) => {
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

// para ver y modificar especies
// Mostrar lista de especies
app.get('/lista_especies', async (req, res) => {
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

// Eliminar una especie
app.post('/eliminar_especie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Especies WHERE id_especie = $1', [id]);
    res.redirect('/lista_especies');
  } catch (err) {
    console.error('Error eliminando especie:', err);
    res.status(500).send('Error eliminando especie');
  }
});
//modificar especies
// Mostrar el formulario para modificar especie
app.get('/modificar_especie/:id', async (req, res) => {
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

// Guardar cambios de la especie
app.post('/modificar_especie/:id', upload.single('fotografia'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    if (fotografia) {
      // Si subió nueva foto
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2, fotografia = $3
        WHERE id_especie = $4
      `, [nombre, descripcion, fotografia, id]);
    } else {
      // Si no subió foto nueva
      await db.query(`
        UPDATE Especies
        SET nombre = $1, descripcion = $2
        WHERE id_especie = $3
      `, [nombre, descripcion, id]);
    }

    res.redirect('/lista_especies');
  } catch (err) {
    console.error('Error actualizando especie:', err);
    res.status(500).send('Error actualizando especie');
  }
});

//post para guardar la nueva especie
app.post('/nueva_especie', upload.single('fotografia'), async (req, res) => {
  try {
    const { nombre, id_forma_hoja, id_forma_flor, id_origen, descripcion } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    // Solo uno de los tres debe ir
    let formaHoja = null;
    let formaFlor = null;
    let origen = null;

    if (id_forma_hoja) {
      formaHoja = id_forma_hoja;
    } else if (id_forma_flor) {
      formaFlor = id_forma_flor;
    } else if (id_origen) {
      origen = id_origen;
    }

    await db.query(`
      INSERT INTO Especies (nombre, id_forma_hoja, id_forma_flor, id_origen, fotografia, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [nombre, formaHoja, formaFlor, origen, fotografia, descripcion]);

    res.redirect('/');
  } catch (err) {
    console.error('Error registrando especie:', err);
    res.status(500).send('Error registrando especie');
  }
});