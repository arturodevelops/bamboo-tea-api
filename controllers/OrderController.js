const stripe = require("../models/Stripe")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCheckoutSession = async (req,res) => {
    const items =  req.body.items;
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items:items,
        //example body
        //  [
            
        //     // {     
        //     //     price: 'price_1QNfoAHSsQ6HUBrZPgl1m32j',
        //     //     quantity:2
        //     // },
        //     // {     
        //     //     price: 'price_1QNincHSsQ6HUBrZRlo4H2Ot',
        //     //     quantity:5
        //     // }
        // ],
        mode: 'payment',
        return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`
    })

    res.send({clientSecret: session.client_secret});
    
}


const confirmOrder = async (req,res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    let order_id

    if (session.status == 'complete'){
        const { name, items } = req.body
        const order = await prisma.orders.create({
            data:{
                name
            }
        })
    
         items.forEach(async (drink_item) => {
            await prisma.orders_drinks.create({
                data:{
                    order_id: order.id,
                    drink_id: drink_item.id,
                    amount: drink_item.amount
                }
            })
        });
        
        order_id = order.id
    }

    res.send({
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details.email
    });
}
module.exports.OrderController = { createCheckoutSession, confirmOrder}