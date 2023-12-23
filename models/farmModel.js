const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: {
    type: String
  },
  creationDate: {
    type: Date,
    default: Date.now(),
    required: true
  },
  subscriptionCost: {
    type: Number,
    required: true
  },
  subscriptionCurrency: {
    type: String,
    enum: ['usd', 'eur', 'rub'],
    required: true
  },
  currencyUnit: {
    type: String,
    enum: ['usd', 'eur', 'rub'],
    default: 'rub'
  },
  weightUnit: {
    type: String,
    enum: ['lb', 'kg'],
    default: 'kg'
  },
  liquidUnit: {
    type: String,
    enum: ['gal', 'l'],
    default: 'l'
  },
  animalCategories: [String],
  compoundFeedIngredients: [String],
  feedTypes: [
    {
      name: String,
      alertAmount: Number,
      recuring: {
        type: Boolean,
        default: false
      },
      lastRecuringRecord: Date,
      recuringFrequency: Number
    }
  ],
  nextPayment: {
    type: Date
  },
  nextNotification: {
    type: Date
  },
  subscriptionFrequency: {
    type: Number,
    required: true,
    enum: [1, 6, 12]
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  lastPayment: {
    type: Date
  },
  editedAtBy: [
    {
      date: Date,
      message: String,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }

    }
  ]

});


const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;