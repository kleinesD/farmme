const express = require('express');
const authController = require('../controllers/authController');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.post('/', authController.protect, inventoryController.addInventory);

router.patch('/:id', authController.protect, inventoryController.editInventory);

router.delete('/:id', authController.protect, inventoryController.deleteInventory);

module.exports = router;