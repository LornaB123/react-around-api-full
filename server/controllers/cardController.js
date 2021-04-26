const Card = require('../models/card');

function getCards(req, res) {
  Card.find({})
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Inavlid data passed.' });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'Card not found.' });
      } else {
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });
}

function createCard(req, res) {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Inavlid data passed.' });
      }
      return res.status(500).send({ message: 'Internal server error.' });
    });
}

function deleteCard(req, res) {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Card not found.' });
      } else if (!card.owner._id === req.user._id) {
        res.status(403).send({ message: 'Forbidden. User ID is invalid.' });
      }
      res.status(200).send({ message: 'Card deleted.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Invalid data passed.' });
      } else {
        res.status(500).send({ message: 'Internal server error.' });
      }
    });
}

function likeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Card not found.' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Invalid data passed.' });
      } else {
        res.status(500).send({ message: 'Internal server error.' });
      }
    });
}

function dislikeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // remove _id from the array
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Card not found' });
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Invalid data passed.' });
      }
      res.status(500).send({ message: 'Internal server error' });
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
