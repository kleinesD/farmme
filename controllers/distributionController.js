const Client = require('../models/clientModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.farm = req.user.farm;
  req.body.user = req.user._id;
  const product = await Product.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  })
});

exports.createClient = catchAsync(async (req, res, next) => {
  req.body.farm = req.user.farm;
  req.body.user = req.user._id;
  const client = await Client.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  })
});

exports.editProduct = catchAsync(async(req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body);

  product.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
})
exports.editClient = catchAsync(async(req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body);

  client.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await client.save();

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
})

exports.deleteProduct = catchAsync(async(req, res, next) => {
  const product = await Product.findByIdAndRemove((req.params.id));

  res.status(203).json({
    status: 'success'
  });
});

exports.deleteSubIdProducts = catchAsync(async(req, res, next) => {
  const products = await Product.deleteMany({subId: req.params.subId});

  res.status(203).json({
    status: 'success'
  });
});

exports.getClient = catchAsync(async(req, res, next) => {
  const client = await Client.findById(req.params.clientId);
  const sales = await Product.find({ client: req.params.clientId, distributionResult: 'sold', date: { $gte: req.params.start, $lte: req.params.end } });

  res.status(200).json({
    status: 'success',
    data: {
      client,
      sales
    }
  })
}); 