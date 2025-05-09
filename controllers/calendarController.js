const Calendar = require('../models/calendarModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addReminder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.farm = req.user.farm;
  const reminder = await Calendar.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      reminder
    }
  });
});

exports.editReminder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.farm = req.user.farm;
  const reminder = await Calendar.findByIdAndUpdate(req.params.id, req.body);

  reminder.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await reminder.save();

  res.status(200).json({
    status: 'success',
    data: {
      reminder
    }
  });
});

exports.deleteReminder = catchAsync(async (req, res, next) => {
  const reminder = await Calendar.findByIdAndDelete(req.params.id)

  res.status(203).json({
    status: 'success'
  });
});

exports.getModuleAndPeriod = catchAsync(async (req, res, next) => {
  const reminders = await Calendar.find({ farm: req.user.farm, module: req.body.module, date: { $gte: req.body.from, $lte: req.body.to } }).populate('animal').populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      reminders
    }
  });
});

exports.getFarmReminders = catchAsync(async (req, res, next) => {
  const reminders = await Calendar.find({ farm: req.user.farm, module: {$ne: 'order'}, date: { $gte: req.body.from, $lte: req.body.to } }).populate('animal').populate('user');
  


  res.status(200).json({
    status: 'success',
    data: {
      reminders
    }
  });
});

exports.deleteSubIdReminders = catchAsync(async (req, res, next) => {
  await Calendar.deleteMany({ subId: req.params.subId });

  res.status(200).json({
    status: 'success'
  });
});