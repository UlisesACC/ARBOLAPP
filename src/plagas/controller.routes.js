const express = require('express');
const router = express.Router();

// Renderizar el formulario de plagas
router.get('/formulario_plagas', (req, res) => {
  res.render('plagas/plagas');
});

module.exports = router;
