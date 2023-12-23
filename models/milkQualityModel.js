const mongoose = require('mongoose');

const milkQualitySchema = new mongoose.Schema({
  water: Number,
  dryResidue: Number,
  fat: Number,
  casein: Number,
  sugar: Number,
  phosphatides: Number,
  sterols: Number,
  albumen: Number,
  /* globulin and other proteins */
  otherProteins: Number,
  nonProteinCompounds: Number,
  saltsOfInorganicAcids: Number,
  ash: Number,
  pigments: Number,
  animal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  date: {
    type: Date,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
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

const MilkQuality = mongoose.model('MilkQuality', milkQualitySchema);
module.exports = MilkQuality;