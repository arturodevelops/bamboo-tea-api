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
    const orders = await prisma.orders.findMany({
      include: {
        orders_drinks: {
          include: {
            drink: true,
          },
        },
      },
    });
    res.send(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ error: "Failed to fetch orders" });
  }
};

module.exports.OrderController = {
  createCheckoutSession,
  confirmOrder,
  getAllOrders,
};
