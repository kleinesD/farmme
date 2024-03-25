const mongoose = require('mongoose');

const calendarScheme = new mongoose.Schema({
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
  name: {
    type: String
  },
  icon: String,
  note: String,
  date: {
    type: Date
  },
  recuring: {
    type: Boolean,
    default: false
  },
  recuringDay: Number,
  recuringTime: String, 
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  module: {
    type: String,
    required: true,
    enum: ['general', 'herd', 'vet', 'warehouse', 'distribution', 'feed', 'order']
  },
  notified: {
    type: Boolean,
    default: false
  },
  reminders: [
    {
      date: Date,
      notified: {
        type: Boolean,
        default: false
      }
    }
  ],
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  product: {
    type: String
  },
  size: {
    type: Number
  },
  unit: {
    type: String
  },
  subId: String,
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

const Calendar = mongoose.model('Calendar', calendarScheme);
module.exports = Calendar;