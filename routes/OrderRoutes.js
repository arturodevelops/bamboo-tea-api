const express = require('express');
const { OrderController } = require('../controllers/OrderController');
const router = express.Router();

router.post('/create-session', OrderController.createCheckoutSession);
router.get('/confirm-order', OrderController.confirmOrder);



module.exports.OrderRoutes =  {router};
