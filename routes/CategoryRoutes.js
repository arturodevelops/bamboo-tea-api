const express = require('express');
const { CategoryController } = require('../controllers/CategoryController');
const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.post('/', CategoryController.createCategory);
router.get('/:id', CategoryController.getCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports.categoryRoutes = { router };
