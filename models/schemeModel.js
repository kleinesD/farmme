const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: String,
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  points: [
    {
      action: String,
      countFrom: {
        type: String,
        enum: ['last-point', 'start']
      },
      scheduledIn: Number,
      timeUnit: {
        type: String,
        enum: ['h', 'd']
      },
      firstPoint: {
        type: Boolean,
        default: false
      }
    }
  ],
  included: {
    type: Boolean,
    default: false
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

const Scheme = mongoose.model('Scheme', schemeSchema);
module.exports = Scheme;