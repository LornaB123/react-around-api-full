const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors, isCelebrateError } = require('celebrate');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');

const { requestLogger, errorLogger } = require('./server/middleware/logger');
const auth = require('./server/middleware/auth');
const BadRequestError = require('./server/errors/bad-req-error');
const NotFoundError = require('./server/errors/not-found-error');
const ConflictError = require('./server/errors/conflict-error');
const userRouter = require('./server/routes/users');
const cardRouter = require('./server/routes/cards');

const { PORT = 3001 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/aroundb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(errorLogger);
app.use(errors());

app.use('/', userRouter);
app.use('/', cardRouter);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).pattern(new RegExp('^[a-zA-Z-\\s]*$')),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().uri(),
      email: Joi.string().required().email(),
      password: Joi.string().min(8).alphanum().required(),
    }),
  }),
  createUser
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login
);

app.use((err, req, res, next) => {
  // if an error has no status, display 500
  const { statusCode = 500, message } = err;
  if (isCelebrateError(err)) {
    throw new ConflictError('User already taken.');
  }
  res
    .status(statusCode)
    .send({
      // check the status, display message
      message: statusCode === 500 
      ? 'An error has occured on the server' 
      : message,
    });
});

app.get('*', (req, res) => {
  res.status(404).send({ message: 'Requested resource not found' });
});

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    throw new BadRequestError(
      'Request cannot be completed at this time.'
    );
  }
  next(err);
});

app.use((req, res) => {
  throw new NotFoundError('Requested resource not found.')
})

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
