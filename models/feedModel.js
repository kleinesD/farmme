const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['record', 'sample']
  },
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
  unit: {
    type: String,
    enum: ['kg', 'bale']
  },
  ingredients: [
    {
      name: String,
      percent: Number
    }
  ],
  animalGroup: {
    type: String
  },
  autoAction: Boolean,
  autoActionStop: Boolean,
  autoActionStopDate: Date,
  autoTimeSpan: Number,
  autoTimeSpanUnit: {
    type: String,
    enum: ['day', 'week']
  },
  nextAutoAction: Date,
  date: Date,
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  firstAction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Feed'
  },
  feed: {
    type: mongoose.Schema.ObjectId,
    ref: 'Feed'
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm',
    required: true
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

const Feed = mongoose.model('Feed', feedSchema);
module.exports = Feed;