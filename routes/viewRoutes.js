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

router.get('/edit-farm', authController.protect, authController.isLoggedIn, viewController.renderEditFarm);

router.get('/edit-user', authController.protect, authController.isLoggedIn, viewController.renderEditUser);

router.get('/change-restrictions/:userId', authController.protect, authController.isLoggedIn, viewController.renderChangeRestrictions);

router.get('/all-employees/:farmId', authController.protect, authController.isLoggedIn, viewController.renderAllEmployees);

router.get('/reports', authController.protect, authController.isLoggedIn, viewController.renderReports)

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

router.get('/herd/history', authController.protect, authController.isLoggedIn, viewController.renderHerdHistory);

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

router.get('/vet/', authController.protect, authController.isLoggedIn, viewController.renderVetMain);

router.get('/vet/history', authController.protect, authController.isLoggedIn, viewController.renderVetHistory);

///////////////////////////
///////////////////////////
///////////////////////////
/* WAREHOUSE MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////

router.get('/warehouse/add-inventory/', authController.protect, authController.isLoggedIn, viewController.renderAddInventory);

router.get('/warehouse/edit-inventory/:inventoryId', authController.protect, authController.isLoggedIn, viewController.renderEditInventory);

///////////////////////////
///////////////////////////
///////////////////////////
/* DISTRIBUTION MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////

router.get('/distribution/add-client', authController.protect, authController.isLoggedIn, viewController.renderAddClient);

router.get('/distribution/edit-client/:id', authController.protect, authController.isLoggedIn, viewController.renderEditClient);

router.get('/distribution/add-product-decide', authController.protect, authController.isLoggedIn, viewController.renderAddProductDecide);

router.get('/distribution/add-product', authController.protect, authController.isLoggedIn, viewController.renderAddProduct);

router.get('/distribution/edit-product/:id', authController.protect, authController.isLoggedIn, viewController.renderEditProduct);

router.get('/distribution/add-process/:product', authController.protect, authController.isLoggedIn, viewController.renderAddProcess);

router.get('/distribution/edit-process/:id', authController.protect, authController.isLoggedIn, viewController.renderEditProcess);

router.get('/distribution/add-order', authController.protect, authController.isLoggedIn, viewController.renderAddOrder);

router.get('/distribution/edit-order/:id', authController.protect, authController.isLoggedIn, viewController.renderEditOrder);

router.get('/distribution/add-sale', authController.protect, authController.isLoggedIn, viewController.renderAddSale);

router.get('/distribution/edit-sale/:id', authController.protect, authController.isLoggedIn, viewController.renderEditSale);

router.get('/distribution/add-consumption', authController.protect, authController.isLoggedIn, viewController.renderAddConsumption);

router.get('/distribution/edit-consumption/:id', authController.protect, authController.isLoggedIn, viewController.renderEditConsumption);

router.get('/distribution/add-outgo-decide', authController.protect, authController.isLoggedIn, viewController.renderAddOutgoDecide);

router.get('/distribution/all-products', authController.protect, authController.isLoggedIn, viewController.renderAllProducts);

router.get('/distribution/all-clients', authController.protect, authController.isLoggedIn, viewController.renderAllClients);

router.get('/distribution/add-write-off/:product', authController.protect, authController.isLoggedIn, viewController.renderAddWriteOff);

router.get('/distribution/edit-write-off/:id', authController.protect, authController.isLoggedIn, viewController.renderEditWriteOff);

router.get('/distribution/', authController.protect, authController.isLoggedIn, viewController.renderDistMain);

///////////////////////////
///////////////////////////
///////////////////////////
/* FEEDING MODULE ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////
router.get('/feed/sample', authController.protect, authController.isLoggedIn, viewController.renderAddFeed);

router.get('/feed/sample/edit/:id', authController.protect, authController.isLoggedIn, viewController.renderEditFeed);

router.get('/feed/record', authController.protect, authController.isLoggedIn, viewController.renderAddFeedRecord);

router.get('/feed/record/edit/:id', authController.protect, authController.isLoggedIn, viewController.renderEditFeedRecord);

router.get('/feed/', authController.protect, authController.isLoggedIn, viewController.renderFeedMain);

///////////////////////////
///////////////////////////
///////////////////////////
/* MILK QUALITY ROUTES */
///////////////////////////
///////////////////////////
///////////////////////////
router.get('/milk-quality/add', authController.protect, authController.isLoggedIn, viewController.renderAddMilkQuality);

router.get('/milk-quality/edit/:id', authController.protect, authController.isLoggedIn, viewController.renderEditMilkQuality);

module.exports = router;