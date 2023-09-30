const express = require('express');
const animalController = require('../controllers/animalController');
const authController = require('../controllers/authController');


const router = express.Router();

router.get('/', authController.protect, animalController.getAllAnimals)

router.get('/:animalId', authController.protect, animalController.getOneAnimal)

router.post('/', authController.protect, animalController.addOneAnimal);

router.patch('/:animalId', authController.protect, animalController.updateOneAnimal);

router.get('/animal-by-number/:number', authController.protect, animalController.getAnimalByNumber);

router.post('/lactation/:animalId', authController.protect, animalController.addLactation);

router.patch('/lactation/:animalId/:index', authController.protect, animalController.updateLactation);

router.delete('/lactation/:animalId/:id', authController.protect, animalController.deleteLactation);

router.post('/milking-results/:animalId', authController.protect, animalController.addMilkingResult);

router.patch('/milking-results/:animalId/:index', authController.protect, animalController.updateMilkingResult);

router.delete('/milking-results/:animalId/:id', authController.protect, animalController.deleteMilkingResult);

router.post('/weight/:animalId', authController.protect, animalController.addWeightResult);

router.patch('/weight/:animalId/:index', authController.protect, animalController.updateWeightResult);

router.delete('/weight/:animalId/:id', authController.protect, animalController.deleteWeightResult);

router.post('/insemination/:animalId', authController.protect, animalController.addInsemination);

router.patch('/insemination/:animalId/:index', authController.protect, animalController.updateInsemination);

router.delete('/insemination/:animalId/:id', authController.protect, animalController.deleteInsemination);

router.patch('/write-off/animal/:animalId', authController.protect, animalController.writeOffAnimal);

router.patch('/write-off/multiple-animals', authController.protect, animalController.writeOffMultipleAnimals);

router.patch('/bring-back-animal/:animalId', authController.protect, animalController.bringBackAnimal);

router.get('/milking-projection/:animalId', authController.protect, animalController.milkingProjectionData);

router.get('/check-by-field/:field/:value', authController.protect, animalController.checkAnimalByField)

module.exports = router;