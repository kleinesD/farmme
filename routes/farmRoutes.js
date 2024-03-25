const express = require('express');
const farmController = require('../controllers/farmController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/', authController.protect, farmController.createFarm);

router.patch('/edit-farm/:farmId', authController.protect, farmController.editFarm);

router.patch('/add-category/:farmId', authController.protect, farmController.addCategory);

router.patch('/add-building/:farmId', authController.protect, farmController.addBuilding);

router.get('/get-projection-data/:farmId', authController.protect, farmController.getProjectionData);








module.exports = router