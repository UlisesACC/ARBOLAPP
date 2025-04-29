//renderizando las subespecies
app.get('/subespecies/:id_especie', async (req, res) => {
  try {
    const { id_especie } = req.params;
    const subespeciesResult = await db.query('SELECT * FROM Subespecies WHERE id_especie = $1', [id_especie]);
    res.json(subespeciesResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar subespecies');
  }
});
// para las subespecies
// Mostrar el formulario para nueva subespecie
app.get('/nueva_subespecie', async (req, res) => {
  try {
    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');
    res.render('subespecies/new_subespecies', { especies: especiesResult.rows });
  } catch (err) {
    console.error('Error cargando formulario de subespecies:', err);
    res.status(500).send('Error cargando formulario');
  }
});

// Guardar nueva subespecie
app.post('/nueva_subespecie', async (req, res) => {
  try {
    const { id_especie, nombre_subespecie } = req.body;

    await db.query(`
      INSERT INTO Subespecies (id_especie, nombre)
      VALUES ($1, $2)
    `, [id_especie, nombre_subespecie]);

    res.redirect('/nueva_subespecie'); // Redirigir a la misma página o a donde tú prefieras
  } catch (err) {
    console.error('Error registrando subespecie:', err);
    res.status(500).send('Error registrando subespecie');
  }
});

//Eliminar y modificar subespecies
// Mostrar lista de subespecies
app.get('/lista_subespecies', async (req, res) => {
  try {
    const subespeciesResult = await db.query(`
      SELECT s.id_subespecie, s.nombre AS nombre_subespecie, e.nombre AS nombre_especie
      FROM Subespecies s
      JOIN Especies e ON s.id_especie = e.id_especie
      ORDER BY e.nombre, s.nombre
    `);
    res.render('subespecies/lista_subespecies', { subespecies: subespeciesResult.rows });
  } catch (err) {
    console.error('Error cargando lista de subespecies:', err);
    res.status(500).send('Error cargando subespecies');
  }
});

// Eliminar subespecie
app.post('/eliminar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Subespecies WHERE id_subespecie = $1', [id]);
    res.redirect('/lista_subespecies');
  } catch (err) {
    console.error('Error eliminando subespecie:', err);
    res.status(500).send('Error eliminando subespecie');
  }
});
// Mostrar formulario para modificar subespecie
app.get('/modificar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subespecieResult = await db.query(`
      SELECT s.id_subespecie, s.nombre AS nombre_subespecie, e.id_especie, e.nombre AS nombre_especie
      FROM Subespecies s
      JOIN Especies e ON s.id_especie = e.id_especie
      WHERE id_subespecie = $1
    `, [id]);

    const especiesResult = await db.query('SELECT id_especie, nombre FROM Especies ORDER BY nombre');

    if (subespecieResult.rows.length === 0) {
      return res.status(404).send('Subespecie no encontrada');
    }

    res.render('subespecies/modificar_subespecie', { 
      subespecie: subespecieResult.rows[0],
      especies: especiesResult.rows
    });
  } catch (err) {
    console.error('Error mostrando subespecie para modificar:', err);
    res.status(500).send('Error cargando subespecie');
  }
});

// Guardar cambios de la subespecie
app.post('/modificar_subespecie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_especie, nombre_subespecie } = req.body;

    await db.query(`
      UPDATE Subespecies
      SET id_especie = $1, nombre = $2
      WHERE id_subespecie = $3
    `, [id_especie, nombre_subespecie, id]);

    res.redirect('/lista_subespecies');
  } catch (err) {
    console.error('Error actualizando subespecie:', err);
    res.status(500).send('Error actualizando subespecie');
  }
});
