const express = require('express');
const {
  getAllDrinks,
  createDrink,
  getDrink,
  updateDrink,
  deleteDrink,
} = require('../controllers/DrinkController');
const upload = require('../middleware/multer');
const router = express.Router();

router.get('/', getAllDrinks);
router.post('/', upload.single('image'),createDrink);
router.get('/:id', getDrink);
router.put('/:id',upload.single('image'),updateDrink);
router.delete('/:id', deleteDrink);

module.exports.drinkRoutes = {router};
