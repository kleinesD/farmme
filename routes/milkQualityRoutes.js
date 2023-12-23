const express = require('express');
const authController = require('../controllers/authController');
const milkQualityController = require('../controllers/milkQualityController');

const router = express.Router();

router.post('/', authController.protect, milkQualityController.createMilkQualityRecord);

router.patch('/:id', authController.protect, milkQualityController.editMilkQualityRecord);

router.get('/', authController.protect, milkQualityController.getMilkingRecords);

module.exports = router;
