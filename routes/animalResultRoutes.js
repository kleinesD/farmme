const express = require('express');
const animalResultController = require('../controllers/animalResultController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/', authController.protect, animalResultController.addAnimalResult);

router.patch('/:id', authController.protect, animalResultController.editAnimalResult);

router.delete('/:id', authController.protect, animalResultController.deleteAnimalResult);

module.exports = router;