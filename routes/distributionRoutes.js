const express = require('express');
const authController = require('../controllers/authController');
const distributionController = require('../controllers/distributionController');

const router = express.Router();

router.post('/client', authController.protect, distributionController.createClient);

router.post('/product', authController.protect, distributionController.createProduct);

router.patch('/client/:id', authController.protect, distributionController.editClient);

router.patch('/product/:id', authController.protect, distributionController.editProduct);

router.delete('/product/:id', authController.protect, distributionController.deleteProduct);

module.exports = router;