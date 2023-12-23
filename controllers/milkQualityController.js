const MilkQuality = require('../models/milkQualityModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createMilkQualityRecord = catchAsync(async(req, res, next) => {
  req.body.user = req.user._id;
  req.body.farm = req.user.farm;
  const record = await MilkQuality.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      record
    }
  })
}); 

exports.editMilkQualityRecord = catchAsync(async(req, res, next) => {
  const record = await MilkQuality.findByIdAndUpdate(req.params.id, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      record
    }
  })
}); 

exports.getMilkingRecords = catchAsync(async(req, res, next) => {
  const records = await MilkQuality.find({farm: req.user.farm});

  res.status(200).json({
    status: 'success',
    data: {
      records
    }
  })
});
