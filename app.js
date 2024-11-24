require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const cors = require('cors')
const app = express();


app.use(express.json());
app.use(cors({
  methods:'GET,POST,DELETE,{PUT}',
  credentials:true
}))

routes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
