const Feed = require('../models/feedModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.addRecord = catchAsync(async (req, res, next) => {
  req.body.farm = req.user.farm;
  if (req.body.autoRefill || req.body.autoWriteOff) {
    req.body.nextAutoAction = new Date(new Date(req.body.date).getTime() + req.body.autoTimeSpan * 24 * 60 * 60 * 1000);
  }

  const record = await Feed.create(req.body);


  res.status(201).json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.editRecord = catchAsync(async (req, res, next) => {
  if (req.body.autoRefill || req.body.autoWriteOff) {
    req.body.nextAutoAction = new Date(new Date(req.body.date).getTime() + req.body.autoTimeSpan * 24 * 60 * 60 * 1000);
  }
  const record = await Feed.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.deleteRecord = catchAsync(async (req, res, next) => {
  const record = await Feed.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
  });
});

exports.autoRecord = catchAsync(async (req, res, next) => {
  const records = await Feed.find({ $or: [{ autoRefill: true }, { autoWriteOff: true }] });

  records.forEach(rec => {
    if (new Date(req.nextAutoAction) <= new Date()) {

    }
  });
});