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
      phone: req.body.phone,
      checkout_session_id: session.id,
      status: "pending",
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

      // const order = await prisma.orders.findFirst({
      //   where: { checkout_session_id: req.query.session_id },
      //   select: {
      //     id: true,
      //     phone: true,
      //     name: true,
      //     orders_drinks: {
      //       include: {
      //         drink: true // Include only drinks here
      //       }
      //     }
      //   }
      // });
      

      const order = await prisma.orders.findFirst({
        where: { checkout_session_id: req.query.session_id },
        select: {
          id: true,
          phone: true,
          name: true,
          orders_drinks: {
            select: {
              drink: true, // Include only drinks here
              amount:true
            }
          }
        }
      });
      
      // Transform the result to include only `drinks`
      const formattedOrder = {
        id: order.id,
        phone: order.phone,
        name: order.name,
        drinks: order.orders_drinks.map((od) => ({
          id: od.drink.id,
          name: od.drink.name,
          description: od.drink.description,
          price: od.drink.price,
          amount: od.amount,
          imageUrl: od.drink.imageUrl,
          quantity: od.amount
        })),
      };

      res.status(201).send({
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details.email,
        order_id : order.id,
        order_name: order.name,
        order_number: order.phone,
        orders_drinks: formattedOrder.drinks
      });
    }
    else{
      res.status(404).send({
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details.email,
      });
    }
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
    const transformedOrders = rawOrders.map((order) => ({
      id: order.id,
      name: order.name,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      checkout_session_id: order.checkout_session_id,
      drinks: order.orders_drinks.map((od) => ({
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
    res
      .status(500)
      .json({ error: "Failed to fetch orders. Please try again later." });
  }
};

const orderUpdates = async (req, res) => {
  try {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { session_id } = req.params;

    // Periodically check the order status and send updates
    const interval = setInterval(async () => {
      const order = await prisma.orders.findFirst({
        where: { checkout_session_id: session_id },
      });

      if (order) {
        res.write(`data: ${JSON.stringify({ status: order.status })}\n\n`);

        // End the stream when the order is completed or canceled
        if (order.status === "ready" || order.status === "canceled") {
          clearInterval(interval);
          res.end();
        }
      }
    }, 5000); // Check every 5 seconds

    // Clean up when the client disconnects
    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    console.error("Error in SSE order updates:", error);
    res.status(500).end();
  }
};

const updateOrderStatus = async (req, res) => {
  const session_id = req.params.session_id;
  const status = req.body.status;

  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "picked_up",
    "cancelled",
  ];

  if (!status || status == "") {
    return res.status(400).json({ error: "Missing status" });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }

  try {
    const updatedOrder = await prisma.orders.updateMany({
      data: {
        status,
      },
      where: {
        checkout_session_id: session_id,
      }
    });
    if (updatedOrder.count === 0) {
      return res.status(404).json({error:`No orders found with checkout_session_id: ${session_id}`});
    }

    return res.status(201).json({message:"Order has been updated succesfully"})
  } catch (error) {
    if (error.code) {
      console.error(`Prisma Error [${error.code}]: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error.message}`, error);
    }
  }

};

module.exports.OrderController = {
  createCheckoutSession,
  confirmOrder,
  getAllOrders,
  orderUpdates,
  updateOrderStatus
};
