const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const AuthenticationError = require('../errors/authentication-error');

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization Required');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
      payload = jwt.verify(
        token,
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'
      );
  } catch (err) {
        throw new AuthenticationError('Authorization Required');
  }
  req.user = payload; //assigns payload to the request object
  next(); //sending request to next middleware
};