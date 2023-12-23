const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now()
  },
  name: String,
  dose: {
    amount: Number,
    unit: {
      type: String,
      enum: ['g', 'mg', 'ml']
    }
  },
  category: {
    type: String,
    enum: ['action', 'problem', 'treatment', 'scheme']
  },
  result: String,
  note: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  disease: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vet'
  },
  cured: Boolean,
  animal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  /* For multiple animals actions */
  subId: String,
  scheme: {
    type: mongoose.Schema.ObjectId,
    ref: 'Scheme'
  },
  firstSchemeAction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vet'
  },
  schemeStarter: {
    type: Boolean,
    default: false
  },
  scheduled: {
    type: Boolean,
    default: false
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
  finished: Boolean
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
vetSchema.virtual('otherPoints', {
  ref: 'Vet',
  foreignField: 'firstSchemeAction',
  localField: '_id'
});

vetSchema.virtual('treatments', {
  ref: 'Vet',
  foreignField: 'disease',
  localField: '_id'
});


const Vet = mongoose.model('Vet', vetSchema);

module.exports = Vet;