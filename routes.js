// routes.js
const drinkRoutes = require('./routes/DrinkRoutes');
const setupRoutes = (app) => {
  app.use('/api', drinkRoutes);
};

module.exports = setupRoutes;
