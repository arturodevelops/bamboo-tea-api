const express = require('express');
const {
  getAllDrinks,
  createDrink,
  getDrinkById,
  updateDrink,
  deleteDrink,
} = require('../controllers/DrinkController');
const router = express.Router();

router.get('/drinks', getAllDrinks);
router.post('/drinks', createDrink);
router.get('/drinks/:id', getDrinkById);
router.put('/drinks/:id', updateDrink);
router.delete('/drinks/:id', deleteDrink);

module.exports = router;
