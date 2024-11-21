require('dotenv')

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY);

module.exports = stripe