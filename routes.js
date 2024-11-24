const express = require('express');
const { drinkRoutes } = require('./routes/DrinkRoutes');
const { categoryRoutes } = require('./routes/CategoryRoutes');
const { OrderRoutes } = require('./routes/OrderRoutes');
const { UserRoutes } = require('./routes/UserRoutes');

const routes = (app) => {
  const router = express.Router();

  router.use('/drinks', drinkRoutes.router);
  router.use('/categories', categoryRoutes.router);
  router.use('/orders', OrderRoutes.router);
  router.use('/users',UserRoutes.router)

  app.use('/api', router);
};

module.exports = routes;
