const express = require('express');
const mysql = require('./src/model/model');
const path = require('path');
const route = require('./src/routes/route');


const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/item',route);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
