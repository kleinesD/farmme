const express = require('express');
const farmController = require('../controllers/farmController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/', authController.protect, farmController.createFarm);








module.exports = router