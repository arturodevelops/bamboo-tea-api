const stripe = require("../models/Stripe");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCheckoutSession = async (req, res) => {
  const items = req.body.items;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send({ error: "Invalid items data." });
  }

  // Map items to Stripe's line_items format
  const lineItems = items.map((item) => ({
    price: item.price,
    quantity: item.quantity,
  }));

  // Create a Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: lineItems,
    mode: "payment",
    return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  // Create a pending order in the database
  const order = await prisma.orders.create({
    data: {
      name: req.body.name,
      checkout_session_id: session.id,
      status: "pending", // Pending status for orders awaiting payment confirmation
    },
  });

  // Step 2: Insert drinks explicitly
  const drinkItemsData = items.map((drink_item) => ({
    order_id: order.id,
    drink_id: drink_item.id_drink,
    amount: drink_item.quantity,
  }));

  await prisma.orders_drinks.createMany({
    data: drinkItemsData,
  });

  res.send({ clientSecret: session.client_secret });
};

const confirmOrder = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    if (session.status === "complete") {
      // Update order status to 'confirmed'
      await prisma.orders.updateMany({
        where: { checkout_session_id: req.query.session_id },
        data: { status: "confirmed" },
      });

      console.log("Order confirmed");
      // Function to send a notification for a new order (implement here)
    }

    res.send({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details.email,
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).send({ error: "Failed to confirm order" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Fetch the raw orders data
    const rawOrders = await prisma.orders.findMany({
      include: {
        orders_drinks: {
          include: {
            drink: true, // Include drink data to extract relevant fields
          },
        },
      },
    });

    // Transform the data to exclude orders_drinks and directly include drinks
    const transformedOrders = rawOrders.map(order => ({
      id: order.id,
      name: order.name,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      checkout_session_id: order.checkout_session_id,
      drinks: order.orders_drinks.map(od => ({
        id: od.drink.id,
        name: od.drink.name,
        description: od.drink.description,
        price: od.drink.price,
        amount: od.amount,
        imageUrl: od.drink.imageUrl,
      })),
    }));

    // Send the transformed data as the response
    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders. Please try again later." });
  }
};



module.exports.OrderController = {
  createCheckoutSession,
  confirmOrder,
  getAllOrders,
};
