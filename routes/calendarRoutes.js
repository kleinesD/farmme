const express = require('express');
const calendarController = require('../controllers/calendarController');
const authController = require('../controllers/authController')

const router = express.Router();

router.post('/', authController.protect, calendarController.addReminder);

router.patch('/:id', authController.protect, calendarController.editReminder);

router.delete('/:id', authController.protect, calendarController.deleteReminder);

router.post('/module-and-period', authController.protect, calendarController.getModuleAndPeriod);

router.post('/farm-and-period', authController.protect, calendarController.getFarmReminders);

router.delete('/delete-sub-id/:subId', authController.protect, calendarController.deleteSubIdReminders);


module.exports = router;