const express = require('express')
const authController = require('../controllers/authController');
const vetController = require('../controllers/vetController')

const router = express.Router();

router.post('/action/:animalId', authController.protect, vetController.createVetAction);

router.patch('/action/:actionId', authController.protect, vetController.editVetAction);

router.delete('/action/:actionId', authController.protect, vetController.deleteVetAction);

router.post('/problem/:animalId', authController.protect, vetController.createVetProblem);

router.patch('/problem/:problemId', authController.protect, vetController.editVetProblem);

router.delete('/problem/:problemId', authController.protect, vetController.deleteVetProblem);

router.post('/treatment/:diseaseId', authController.protect, vetController.addTreatment);

router.patch('/treatment/:treatmentId', authController.protect, vetController.editVetTreatment);

router.delete('/treatment/:treatmentId', authController.protect, vetController.deleteVetTreatment);

router.post('/schedule', authController.protect, vetController.createVetScheduledAction);

router.post('/create-scheme', authController.protect, vetController.createScheme);

router.patch('/edit-scheme/:schemeId', authController.protect, vetController.editScheme);

router.delete('/scheme/:schemeId', authController.protect, vetController.deleteScheme);

router.post('/use-scheme/:animalId/', authController.protect, vetController.useScheme);

router.patch('/edit-started-scheme/:firstSchemeAction', authController.protect, vetController.editStartedScheme);

router.delete('/started-scheme/:firstSchemeAction', authController.protect, vetController.deleteStartedScheme)

router.post('/edit-scheme/:schemeId', authController.protect, vetController.editScheme);

router.get('/get-started-scheme/:schemeId', authController.protect, vetController.getStartedScheme);

router.get('/get-problem/:id', authController.protect, vetController.getVetProblem);

router.post('/', authController.protect, vetController.addVetRecord);

router.patch('/:id', authController.protect, vetController.editVetRecord);

module.exports = router;