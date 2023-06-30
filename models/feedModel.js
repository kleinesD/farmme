const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['increase', 'decrease']
  },
  category: {
    type: String,
    enum: ['regular-feed', 'compound-feed']
  },
  name: String,
  amount: Number,
  ingredients: [
    {
      name: String,
      amount: Number,
      percent: NUmber
    }
  ],
  animalGroup: {
    type: String,
    default: 'all'
  },
  date: Date,
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  editedAtBy: [
    {
      date: Date,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }

    }
  ],
});

const Feed = mongoose.model('Feed', feedSchema);
module.exports = Feed;