const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: String,
  number: {
    type: String
  },
  mainPhoto: {
    type: String,
    default: 'default-cow-image.png'
  },
  photos: [{ type: String }],
  colors: [{ type: String }],
  gender: String,
  category: String,
  building: String,
  spot: String,
  status: {
    type: String,
    enum: ['alive', 'diseased'],
    default: 'alive'
  },
  writeOffReason: {
    type: String,
    enum: ['sickness', 'slaughtered', 'sold']
  },
  writeOffNote: String,
  writeOffMoneyReceived: Number,
  writeOffDate: Date,
  healthStatus: {
    type: String,
    enum: ['healthy', 'sick'],
    default: 'healthy'
  },
  breedRussian: {
    type: 'String',
    enum: ['Айршир', 'Голштин', 'Сементал', 'Швицкая', 'Джерси', 'Монбельярд', 'Красно-пёстрая', 'Чёрно-пёстрая', 'Красная Степная']
  },
  breedEnglish: {
    type: 'String',
    enum: ['Ayrshire', 'Holstein', 'Semental', 'Swiss', 'Jersey', 'Montbéliarde', 'Russian Black Pied', 'Russian Red Pied', 'Red Steppe']
  },
  buyCost: Number,
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm',
    required: true
  },
  mother: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  father: {
    type: mongoose.Schema.ObjectId,
    ref: 'Animal'
  },
  responsibleEmployee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  birthDate: Date,
  weightResults: [
    {
      addingDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      result: Number
    }
  ],
  lactations: [
    {
      addingDate: {
        type: Date,
        default: Date.now()
      },
      number: Number,
      startDate: Date,
      finishDate: Date
    }
  ],
  milkingResults: [
    {
      addingDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      result: Number,
      lactationNumber: Number,
      note: String,
      subId: String
    }
  ],
  calvings: [
    {
      addingDate: {
        type: Date,
        default: Date.now()
      },
      child: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal'
      },
      date: Date,
      childCondition: {
        type: String,
        enum: ['alive', 'dead']
      },
      withHelp: {
        type: Boolean,
        default: false
      }
    }
  ],
  inseminations: [
    {
      addingDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      success: Boolean,
      type: {
        type: String,
        enum: ['natural', 'artifical']
      },
      bull: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal'
      }
    }
  ],
  currentInfoAB: {
    message: String,
    status: {
      type: String,
      enum: ['on-schedule', 'urgent', 'regular']
    }
  },
  pregnancy: Boolean,
  pregnancyStart: Date,
  costOfServiceHistory: [
    {
      updateDate: Date,
      cost: Number
    }
  ],
  creationDate: {
    type: Date,
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
  forDevelopment: {
    type: Boolean,
    default: false
  }
});

animalSchema.pre(/^find/, function (next) {
  this.populate('mother').populate('father');

  next();
});

animalSchema.pre('updateOne', function (next) {
  this.editedAtBy.push({ date: new Date });
  next();
});



const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;