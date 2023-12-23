const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    counter: this.getAllUsers.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.editUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);

  user.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.checkEmail = catchAsync(async(req, res, next) => {
  let response = true;
  if(await User.findOne({email: req.params.email})) response = false;

  res.status(200).json({
    status: 'success',
    data: {
      response
    }
  });
});