const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require("../models/Stripe");
const deleteImageFromS3 = require('../functions/deleteImageFromS3');

const getAllDrinks = async (req, res) => {
  try {
    const category = parseInt(req.query.category); 
    const where = category ? { category } : undefined; 
    console.log(where);
    const drinks = await prisma.drinks.findMany({ where, include: { categories:true}});
    res.json(drinks);
  } catch (error) {
    console.error('Error fetching drinks:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
};

const createDrink = async (req, res) => {
  let { name, description, price, category } = req.body;
  const image = req.file;

  category = parseInt(category)

  try {
    if (!image) return res.status(400).json({ error: 'Image is required' });

    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: { category },
    });

    const stripePrice = await stripe.prices.create({
      unit_amount: price * 100,
      currency: 'mxn',
      product: stripeProduct.id,
    });

    const newDrink = await prisma.drinks.create({
      data: {
        name,
        description,
        price,
        category,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        imageUrl: image.location, // S3 file URL
      },
    });

    res.status(201).json(newDrink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create drink' });
  }
};


const getDrink = async (req, res) => {
  const { id } = req.params;
  try {
    const drink = await prisma.drinks.findUnique({
      where: { id: parseInt(id) },
      include:{
        categories:true
      }
    });
    if (drink) {
      res.json(drink);
    } else {
      res.status(404).json({ error: 'Drink not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch drink' });
  }
};

const updateDrink = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, price, category } = req.body;
  const image = req.file;

  console.log(image);
     
   try {
     // Step 1: Find the existing drink in the database by its unique id
     const drink = await prisma.drinks.findUnique({ where: { id } });
         
    if (!drink) {
      return res.status(404).json({ error: 'Drink not found' });
    }

    // Step 2: Update product details in Stripe if applicable
    if (name || description || category) {
      await stripe.products.update(drink.stripeProductId, {
        name: name || drink.name,
        description: description || drink.description,
        metadata: { category: category || drink.category },
      });
    }

    // Step 3: Create a new price in Stripe if the price has changed
    if (price && price !== drink.price) {
      await stripe.prices.create({
        unit_amount: price * 100, // Price in cents
        currency: 'mxn',
        product: drink.stripeProductId,
      });S
    }

    if (image) {
      // Check if the drink has an imageUrl and it's not null or empty
      if (drink.imageUrl && drink.imageUrl !== 'null' && drink.imageUrl !== '') {
        // Delete the old image from S3 if a new image is uploaded
        await deleteImageFromS3(drink.imageUrl.split('/').pop()); // Assuming imageUrl contains the full S3 URL
      }
    }
    

    console.log(image.location);
    

    const updatedDrink = await prisma.drinks.update({
      where: { id: parseInt(id) },
      data: { name, description, price, category, imageUrl: image ? image.location : drink.imageUrl }
    });

    res.json(updatedDrink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update drink' });
  }
};

const deleteDrink = async (req, res) => {
  const { id } = req.params;

  try {
    const drink = await prisma.drinks.findUnique({ where: { id: parseInt(id) } });
    if (!drink) {
      return res.status(404).json({ error: 'Drink not found' });
    }

    // Check if the drink has an imageUrl and delete it from S3
    if (drink.imageUrl && drink.imageUrl !== 'null' && drink.imageUrl !== '') {
      await deleteImageFromS3(drink.imageUrl.split('/').pop()); // Delete the image from S3
    }

    // Deactivate the product in Stripe
    await stripe.products.update(drink.stripeProductId, { active: false });

    // Delete the drink from the database
    await prisma.drinks.delete({ where: { id: parseInt(id) } });

    res.status(204).end(); // No content response
  } catch (error) {
    console.error(error);
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
