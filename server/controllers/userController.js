const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const BadRequestError = require('../errors/bad-req-error');
const NotFoundError = require('../errors/not-found-error');
const AuthenticationError = require('../errors/authentication-error');
const ConflictError = require('../errors/conflict-error');

const User = require('../models/user');

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;

function getUsers(req, res, next) {
  User.find({})
    .select("+password")
    .then((users) => res.send({ data: users }))
    .catch(next);
}

function getOneUser(req, res, next) {
  User.findById(req.params.id === "me" ? req.user._id : req.params.id)
    .select("+password")
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError("User not found.");
      }
    })
    .catch((err) => {
      if (err.name === "CastError" || err.name === "TypeError") {
        throw new NotFoundError("User not found.");
      }
      next(err);
    })
    .catch(next);
}

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user._doc);
      } else {
        throw new NotFoundError('Imaginary profile detected.  No such profile found');
      }
    })
    .catch(next)
};

function createUser(req, res) {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar, email, password })
  bcrypt.hash(password, 10)
  .then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash
  }))
    .then((user) => res.status(201).send({ _id: user._id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Unable to create user.');
      } else if (err.name === 'MongoError') {
        throw new ConflictError('User already exists');
      }
      next(err);
    })
    .catch(next);
};

function updateUser(req, res, next) {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { $set: { name, about } },
    { new: true, runValidators: true }
  )
    .select('+password')
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(
          'Unable to update user.'
         );
      }
      next(err);
    })
    .catch(next);
}

function updateAvatar(req, res, next) {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { avatar: req.body.avatar },
    { new: true, runValidators: true }
  )
    .select("+password")
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        throw new BadRequestError(
          "Unable to update avatar. Please try again later."
        );
      }
      next(err);
    })
    .catch(next);
}

function login(req, res, next) {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthenticationError('Incorrect email or password.');
      } else {
        req._id = user._id;
        return bcrypt.compare(password, user.password);
      }
    })
    .then((matched) => {
      if (!matched) {
        throw new AuthenticationError('Incorrect email or password.');
      }
      const token = jwt.sign(
        { _id: req._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );
      res.header('authorization', `Bearer ${token}`);
      res.cookie('token', token, { httpOnly: true });
      res.status(200).send({ token });
    })
    .catch(next);
}

module.exports = {
  getUsers,
  getOneUser,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
  login
};
