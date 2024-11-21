const express = require('express');
const {
  getAllDrinks,
  createDrink,
  getDrink,
  updateDrink,
  deleteDrink,
} = require('../controllers/DrinkController');
const router = express.Router();

router.get('/drinks', getAllDrinks);
router.post('/drinks', createDrink);
router.get('/drinks/:id', getDrink);
router.put('/drinks/:id', updateDrink);
router.delete('/drinks/:id', deleteDrink);

module.exports = router;
