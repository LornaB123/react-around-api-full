const User = require('../models/user');

function getUsers(req, res) {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Internal Server Error.' }));
}

function getOneUser(req, res) {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'User cannot be found' });
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(404).send({ message: 'Validation failed:  user cannot be found.' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'User not found.' });
      } else {
        res.status(500).send({ message: 'Internal server error.' });
      }
    });
}

function createUser(req, res) {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(404).send({ message: 'Validation failed:  user cannot be created.' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'User not found.' });
      } else {
        res.status(500).send({ message: 'Internal server error.' });
      }
    });
}

function updateUser(req, res) {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Validation failed:  user cannot be updated.' });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'User not found.' });
      } else {
        res.status(500).send({ message: 'Internal server error' });
      }
    });
}

function updateAvatar(req, res) {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'User cannot be found' });
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Validation failed:  avatar cannot be updated.' });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'User not found.' });
      } else {
        res.status(500).send({ message: 'Internal server error' });
      }
    });
}

module.exports = {
  getUsers,
  getOneUser,
  createUser,
  updateUser,
  updateAvatar,
};
