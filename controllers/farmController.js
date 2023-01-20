const Farm = require('../models/farmModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllFarms = async (req, res, next) => {
  const farms = await Farm.find();

  res.status(200).json({
    status: 'success',
    counter: farms.length,
    data: {
      farms
    }
  });
}

exports.createFarm = catchAsync(async (req, res, next) => {
  req.body.owner = req.user._id;
  const farm = await Farm.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      farm
    }
  });
});