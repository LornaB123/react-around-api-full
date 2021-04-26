const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;

const app = express();

const helmet = require('helmet');

const userRouter = require('./server/routes/users');
const cardRouter = require('./server/routes/cards');

mongoose.connect('mongodb://localhost:27017/aroundb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  req.user = {
    _id: '6061f394d0a58b3b58985b41', // paste the _id of the test user created in the previous step
  };
  next();
});
app.use('/', userRouter);
app.use('/', cardRouter);

app.all('*', (req, res) => {
  res.status(400).send({ message: 'Requested resource not found' });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
