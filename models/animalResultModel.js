const mongoose = require('mongoose');

const animalResultSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  type: {
    type: String,
    enum: ['milking', 'weight', 'lactation']
  },
  date: Date,
  startDate: Date,
  finishDate: Date,
  result: Number,
  lactationNumber: Number,
  lactation: {
    type: mongoose.Schema.ObjectId,
    ref: 'AnimalResult'
  },
  calf: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  note: String,
  subId: String,
  creationDate: {
    type: Date,
    default: Date.now()
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
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
},
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  });

const AnimalResult = mongoose.model('AnimalResult', animalResultSchema);
module.exports = AnimalResult;