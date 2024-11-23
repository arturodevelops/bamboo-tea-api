const express = require('express');
const {
  getAllDrinks,
  createDrink,
  getDrink,
  updateDrink,
  deleteDrink,
} = require('../controllers/DrinkController');
const upload = require('../functions/multer');
const router = express.Router();

router.get('/', getAllDrinks);
router.post('/', upload.single('image'),createDrink);
router.get('/:id', getDrink);
router.put('/:id', updateDrink);
router.delete('/:id', deleteDrink);

module.exports.drinkRoutes = {router};
