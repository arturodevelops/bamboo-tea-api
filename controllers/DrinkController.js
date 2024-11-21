const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDrinks = async (req, res) => {
  try {
    const { category } = req.headers; 
    const where = category ? { category } : undefined; 
    const drinks = await prisma.drinks.findMany({ where, include: { categories:true}});
    res.json(drinks);
  } catch (error) {
    console.error('Error fetching drinks:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
};


const createDrink = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const newDrink = await prisma.drinks.create({
      data: { name, description, price,category },
    });
    res.status(201).json(newDrink);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create drink' });
  }
};

const getDrink = async (req, res) => {
  const { id } = req.params;
  try {
    const drink = await prisma.drinks.findUnique({
      where: { id: parseInt(id) },
      include:{
        categories
      }
    });
    if (drink) {
      res.json(drink);
    } else {
      res.status(404).json({ error: 'Drink not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drink' });
  }
};

const updateDrink = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const updatedDrink = await prisma.drinks.update({
      where: { id: parseInt(id) },
      data: { name, description, price,category },
    });
    res.json(updatedDrink);
  } catch (error) {
    console.log(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Drink not found' });
    } else {
      res.status(500).json({ error: 'Failed to update drink' });
    }
  }
};

const deleteDrink = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.drinks.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();  
  } catch (error) {
    console.log(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Drink not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete drink' });
    }
  }
};

module.exports = {
  getAllDrinks,
  createDrink,
  getDrink,
  updateDrink,
  deleteDrink,
};
