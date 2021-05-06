const express = require('express');
const router = express.Router();
const { celebrate, Joi } = require('celebrate');

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cardController');

router.get('/cards', getCards);

router.post('/cards', 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().uri(),
    }),
  }), createCard);

router.delete('/cards/:cardId', deleteCard);

router.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), likeCard);

router.delete('/cards/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }), dislikeCard);

module.exports = router;
