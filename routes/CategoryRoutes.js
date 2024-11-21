const express = require('express');
const {CategoryController} = require('../controllers/CategoryController')
const router = express.Router();

router.get('/category', CategoryController.getAllCategories);
router.post('/category', CategoryController.createCategory);
router.get('/category/:id', CategoryController.getCategory);
router.put('/category/:id', CategoryController.updateCategory);
router.delete('/category/:id', CategoryController.deleteCategory);

module.exports =  router;
