const mongoose = require('mongoose');
const AnimalResult = require('./animalResultModel');


/* mongoose.set('debug', true); */

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
    enum: ['alive', 'diseased', 'dead-birth'],
    default: 'alive'
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
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
      creationDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      result: Number,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      note: String,
      subId: String,
    }
  ],
  lactations: [
    {
      creationDate: {
        type: Date,
        default: Date.now()
      },
      number: Number,
      startDate: Date,
      finishDate: Date,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    }
  ],
  milkingResults: [
    {
      creationDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      result: Number,
      lactationNumber: Number,
      note: String,
      subId: String,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    }
  ],
  inseminations: [
    {
      creationDate: {
        type: Date,
        default: Date.now()
      },
      date: Date,
      success: {
        type: String,
        enum: ['true', 'false', 'undefined'],
        default: 'undefined'
      },
      type: {
        type: String,
        enum: ['natural', 'artificial']
      },
      bull: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal'
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    }
  ],
  notes: [{
    text: String,
    date: {
      type: Date,
      default: Date.now()
    }
  }],
  currentInfoAB: {
    message: String,
    status: {
      type: String,
      enum: ['on-schedule', 'urgent', 'regular']
    }
  },
  costOfServiceHistory: [
    {
      updateDate: Date,
      cost: Number
    }
  ],
  deadBirthDate: Date,
  deadBirthMotherDeath: Boolean,
  deadBirthMotherDeathAuto: Boolean,
  deadBirthMultipleFetuses: Boolean,
  deadBirthSize: {
    type: String,
    enum: ['small', 'mid', 'large']
  },
  deadBirthNote: String,
  butcherSuggestion: {
    type: Boolean,
    default: false
  },
  butcherSuggestionReason: {
    type: String,
    enum: ['weight', 'age', 'sick', 'insemination']
  },
  writeOffReason: {
    type: String,
    enum: ['sickness', 'slaughtered', 'sold', 'birth-death']
  },
  writeOffSubReason: {
    type: String,
    enum: ['alive', 'slaughtered']
  },
  writeOffNote: String,
  writeOffMoneyReceived: Number,
  writeOffDate: Date,
  creationDate: {
    type: Date,
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
  forDevelopment: {
    type: Boolean,
    default: false
  }
},
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
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