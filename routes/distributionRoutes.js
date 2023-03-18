const express = require('express');
const authController = require('../controllers/authController');
const distributionController = require('../controllers/distributionController');

const router = new express.Router();

router.post('/client', authController.protect, distributionController.createClient);

router.post('/product', authController.protect, distributionController.createProduct);

router.patch('/client/:id', authController.protect, distributionController.editClient);

router.patch('/product/:id', authController.protect, distributionController.editProduct);

module.exports = router;