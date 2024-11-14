// app.js
const express = require('express');
const setupRoutes = require('./routes');
const app = express();

app.use(express.json());

// Initialize routes
setupRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
