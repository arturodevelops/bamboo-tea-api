const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};


const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await prisma.categories.create({
      data: { name},
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.categories.findUnique({
      where: { id: parseInt(id) },
    });
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    console.log(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.categories.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();  
  } catch (error) {
    console.log(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
};

module.exports.CategoryController = {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
