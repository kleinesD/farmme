const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

///////////////////////////
///////////////////////////
///////////////////////////
/* BASIC ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////
router.get('/login', viewController.renderLogin);

router.get('/', authController.protect, authController.isLoggedIn, viewController.renderMain);

router.get('/calendar', authController.protect, authController.isLoggedIn, viewController.renderCalendar);

router.get('/add-reminder', authController.protect, authController.isLoggedIn, viewController.renderAddReminder);

router.get('/edit-reminder/:reminderId', authController.protect, authController.isLoggedIn, viewController.renderEditReminder);

///////////////////////////
///////////////////////////
///////////////////////////
/* HERD MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////
router.get('/herd', authController.protect, authController.isLoggedIn, viewController.renderHerdMain);

router.get('/herd/add-animal', authController.protect, authController.isLoggedIn, viewController.renderHerdAddAnimal);

router.get('/herd/add-milking-result/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddMilkingResults);

router.get('/herd/add-weight-result/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddWeightResults);

router.get('/herd/add-lactation/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddLactation);

router.get('/herd/add-insemination/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddInsemination);

router.get('/herd/all-animals/', authController.protect, authController.isLoggedIn, viewController.renderAllAnimals);

router.get('/herd/animal-card/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAnimalCard);

router.get('/herd/edit/:type/:animalId', authController.protect, authController.isLoggedIn, viewController.renderEditPage);

router.get('/herd/edit-milking-result/:animalId/:index', authController.protect, authController.isLoggedIn, viewController.renderEditMilkingResults);

router.get('/herd/edit-weight-result/:animalId/:index', authController.protect, authController.isLoggedIn, viewController.renderEditWeightResults);

router.get('/herd/edit-insemination/:animalId/:index', authController.protect, authController.isLoggedIn, viewController.renderEditInsemination);

router.get('/herd/edit-lactation/:animalId/:index', authController.protect, authController.isLoggedIn, viewController.renderEditLactation);

router.get('/herd/edit-animal/:animalId', authController.protect, authController.isLoggedIn, viewController.renderEditAnimal);

router.get('/herd/list-milking-results', authController.protect, authController.isLoggedIn, viewController.renderListMilkingResults);

router.get('/herd/list-inseminations', authController.protect, authController.isLoggedIn, viewController.renderListInseminations);

router.get('/herd/write-off-animal/:animalId', authController.protect, authController.isLoggedIn, viewController.renderWriteOffAnimal);

///////////////////////////
///////////////////////////
///////////////////////////
/* VET MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////
router.get('/vet/add-action/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddVetAction);

router.get('/vet/edit-action/:actionId', authController.protect, authController.isLoggedIn, viewController.renderEditVetAction);

router.get('/vet/add-problem/:animalId', authController.protect, authController.isLoggedIn, viewController.renderAddVetProblem);

router.get('/vet/edit-problem/:problemId', authController.protect, authController.isLoggedIn, viewController.renderEditVetProblem);

router.get('/vet/add-treatment/:diseaseId', authController.protect, authController.isLoggedIn, viewController.renderAddVetTreatment);

router.get('/vet/edit-treatment/:treatmentId', authController.protect, authController.isLoggedIn, viewController.renderEditVetTreatment);

router.get('/vet/add-scheme', authController.protect, authController.isLoggedIn, viewController.renderAddVetScheme);

router.get('/vet/start-scheme/:animalId', authController.protect, authController.isLoggedIn, viewController.renderStartVetScheme);

router.get('/vet/edit-started-scheme/:firstSchemeAction', authController.protect, authController.isLoggedIn, viewController.renderEditStartedVetScheme)

router.get('/vet/edit-scheme/:schemeId', authController.protect, authController.isLoggedIn, viewController.renderEditScheme)

router.get('/vet/history', authController.protect, authController.isLoggedIn, viewController.renderVetHistory);

router.get('/vet/', authController.protect, authController.isLoggedIn, viewController.renderVetMain);

///////////////////////////
///////////////////////////
///////////////////////////
/* WAREHOUSE MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////

router.get('/warehouse/add-inventory/', authController.protect, authController.isLoggedIn, viewController.renderAddInventory);

router.get('/warehouse/edit-inventory/:inventoryId', authController.protect, authController.isLoggedIn, viewController.renderEditInventory);

module.exports = router;