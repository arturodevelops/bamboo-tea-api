const express = require('express');
const { OrderController } = require('../controllers/OrderController');
const router = express.Router();

router.post('/create-session', OrderController.createCheckoutSession);
router.get('/confirm-order', OrderController.confirmOrder);
router.get('/',OrderController.getAllOrders)



module.exports.OrderRoutes =  {router};
