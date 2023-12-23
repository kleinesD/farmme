const Feed = require('../models/feedModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment');

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

exports.getOneRecord = catchAsync(async(req, res, next) => {
  const record = await Feed.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.getFeedRecords = catchAsync(async(req, res, next) => {
  const records = await Feed.find({feed: req.params.feedId});

  res.status(200).json({
    status: 'success',
    data: {
      records
    }
  });
});

exports.editRecord = catchAsync(async (req, res, next) => {
  if (req.body.autoRefill || req.body.autoWriteOff) {
    req.body.nextAutoAction = new Date(new Date(req.body.date).getTime() + req.body.autoTimeSpan * 24 * 60 * 60 * 1000);
  }
  const record = await Feed.findByIdAndUpdate(req.params.id, req.body);

  record.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await record.save();

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

exports.autoAction = catchAsync(async (req, res, next) => {
  const records = await Feed.find({type: 'record', autoAction: true, autoActionStop: {$ne: true}, nextAutoAction: {$lt: Date.now()}});
  
  records.forEach(async rec => {
    const newRecord = await Feed.create({
      type: rec.type,
      status: rec.status,
      amount: rec.amount,
      unit: rec.unit,
      ingredients: rec.ingredients,
      autoAction: false,
      date: rec.nextAutoAction,
      feed: rec.feed,
      farm: rec.farm,
      firstAction: rec._id
    });

    if(newRecord) {
      rec.nextAutoAction = new Date(moment(rec.nextAutoAction).add(rec.autoTimeSpan, rec.autoTimeSpanUnit));
      rec.save();
    }
  });
  
});