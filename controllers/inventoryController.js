const Inventory = require('../models/inventoryModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.addInventory = catchAsync(async(req, res, next) => {
  req.body.farm = req.user.farm;
  const inventory = await Inventory.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      inventory
    }
  });
});

exports.editInventory = catchAsync(async (req, res, next) => {
  const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body);

  inventory.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await inventory.save();

  res.status(200).json({
    status: 'success',
    data: {
      inventory
    }
  });
});

exports.deleteInventory = catchAsync(async(req, res, next) => {
  const inventory = await Inventory.findByIdAndDelete(req.params.id);

  res.status(203).json({
    status: 'success'
  });
});

