const mongoose = require('mongoose');

const inventoryScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  note: String,
  cost: Number,
  quantity: Number,
  creationDate: {
    type: Date,
    default: Date.now()
  },
  date: Date,
  expDate: Date,
  depreciationRate: Number,
  currentValue: Number,
  addMoreAlert: Number,
  instruction: String,
  module: {
    type: String,
    enum: ['all', 'herd', 'vet']
  },
  inventoryType: {
    type: String,
    enum: ['equipment', 'food', 'vet', 'other']
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  animal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
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
  ],
});

const Inventory = mongoose.model('Inventory', inventoryScheme);
module.exports = Inventory;