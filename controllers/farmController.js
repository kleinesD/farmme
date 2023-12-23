const Farm = require('../models/farmModel')
const Animal = require('../models/animalModel')
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

exports.editFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findByIdAndUpdate(req.params.farmId, req.body);

  farm.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await farm.save();

  res.status(200).json({
    status: 'success',
    data: {
      farm
    }
  });
});

exports.addCategory = catchAsync(async (req, res, next) => {
  const farm = await Farm.findByIdAndUpdate(req.params.farmId, { $addToSet: { animalCategories: req.body.category } })

  res.status(200).json({
    status: 'success',
    data: {
      farm
    }
  });
});

exports.getProjectionData = catchAsync(async(req, res, next) => {
  const cows = await Animal.find({farm: req.params.farmId, gender: 'female'});
  const bulls = await Animal.find({farm: req.params.farmId, gender: 'male'});
  const animals = await Animal.find({farm: req.params.farmId});

  res.status(200).json({
    status: 'success',
    data: {
      cows,
      bulls,
      animals
    }
  });
});