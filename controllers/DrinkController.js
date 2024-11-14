// controllers/DrinkController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDrinks = async (req, res) => {
  try {
    const drinks = await prisma.drinks.findMany();
    res.json(drinks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
};

const createDrink = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const newDrink = await prisma.drinks.create({
      data: { name, description, price },
    });
    res.status(201).json(newDrink);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create drink' });
  }
};

// New: Get a single drink by ID (read-only)
const getDrinkById = async (req, res) => {
  const { id } = req.params;
  try {
    const drink = await prisma.drink.findUnique({
      where: { id: parseInt(id) },
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

// New: Update an existing drink by ID
const updateDrink = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const updatedDrink = await prisma.drinks.update({
      where: { id: parseInt(id) },
      data: { name, description, price },
    });
    res.json(updatedDrink);
  } catch (error) {
    console.log(error);
    if (error.code === 'P2025') {
      // Prisma error code for "Record to update not found"
      res.status(404).json({ error: 'Drink not found' });
    } else {
      res.status(500).json({ error: 'Failed to update drink' });
    }
  }
};

// New: Delete a drink by ID
const deleteDrink = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.drinks.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();  // No content response
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
  getDrinkById,
  updateDrink,
  deleteDrink,
};
