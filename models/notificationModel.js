const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  module: {
    type: String,
    default: 'none',
    enum: ['none', 'herd', 'vet', 'distribution', 'feed', 'warehouse', 'calendar']
  },
  icon: String,
  animal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  title: String,
  link: String,
  expandId: String,
  notifierId: String,
  notifierModel: String,
  subId: String,
  notifyAt: Date,
  show: {
    type: Boolean,
    default: true
  },
  deleteAt: Date,
  seen: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;