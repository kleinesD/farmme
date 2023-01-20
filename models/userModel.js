const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['ceo', 'owner', 'manager', 'employee', 'veterenerian', 'milker']
  },
  accessBlocks: {
    type: [String],
    required: true,
    enum: ['herd', 'vet']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 30,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validator: {
      validate: function(val) {
        return val === this.password;
      }
    },
    message: 'Passwords do not match.'
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm'
  },
  resetPasswordToken: String,
  resetPasswordTimer: Date,
  creationDate: {
    type: Date,
    default: Date.now()
  }
});

userSchema.pre('save', async function(next) {
  if(this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.methods.comparePasswords = async function (userPass, candidatePass) {
  return await bcrypt.compare(candidatePass, userPass)
}

userSchema.methods.changedPasswordAfter = function(date)  {
  if(this.passwordChangedAt) {
    const timeStamp = this.passwordChangedAt.getTime() / 1000;

    return timeStamp > date;
  } else {
    return false;
  }
}

const User = mongoose.model('User', userSchema);
module.exports = User;