const express = require('express')
const authController = require('../controllers/authController');
const vetController = require('../controllers/vetController')

const router = express.Router();

router.post('/action/:animalId', authController.protect, vetController.createVetAction);

router.patch('/action/:actionId', authController.protect, vetController.editVetAction);

router.post('/problem/:animalId', authController.protect, vetController.createVetProblem);

router.patch('/problem/:problemId', authController.protect, vetController.editVetProblem);

router.post('/treatment/:diseaseId', authController.protect, vetController.addTreatment);

router.patch('/treatment/:treatmentId', authController.protect, vetController.editVetTreatment);

router.post('/schedule', authController.protect, vetController.createVetScheduledAction);

router.post('/create-scheme', authController.protect, vetController.createScheme);

router.post('/use-scheme/:animalId/', authController.protect, vetController.useScheme);

router.patch('/edit-started-scheme/:firstSchemeAction', authController.protect, vetController.editStartedScheme);

router.post('/edit-scheme/:schemeId', authController.protect, vetController.editScheme);

router.post('/schedule/period', authController.protect, vetController.getSchedulePeriod);

module.exports = router;