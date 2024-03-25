const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.patch('/:id', authController.protect, notificationController.updateNotification);

router.delete('/:id', authController.protect, notificationController.deleteNotification);

router.get('/', authController.protect, notificationController.getNotifications);

module.exports = router;