// routes.js
const drinkRoutes = require('./routes/DrinkRoutes');
const categoryRoutes = require('./routes/CategoryRoutes')


const setupRoutes = (app) => {
  app.use('/api', drinkRoutes);
  app.use('/api', categoryRoutes)
};

module.exports = setupRoutes;
