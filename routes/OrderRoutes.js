const express = require('express');
const { OrderController } = require('../controllers/OrderController');
const router = express.Router();

router.post('/create-session', OrderController.createCheckoutSession);
router.get('/confirm-order', OrderController.confirmOrder);
router.get('/',OrderController.getAllOrders);
router.get('/:session_id/updates', OrderController.orderUpdates);
router.put('/:session_id/update', OrderController.updateOrderStatus)




module.exports.OrderRoutes =  {router};
