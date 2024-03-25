const Vet = require('../models/vetModel');
const Scheme = require('../models/schemeModel');
const Animal = require('../models/animalModel');
const Calendar = require('../models/calendarModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.changeAnimalHealthStatus = async (animalId) => {
  const animal = await Animal.findById(animalId);

  let animalDiseases = await Vet.find({ animal: animal._id, category: 'problem' });

  let sick = false;
  animalDiseases.forEach((dis) => {
    if (dis.cured === false) {
      sick = true;
    }
  });

  if (sick) {
    animal.healthStatus = 'sick';
  } else {
    animal.healthStatus = 'healthy';
  }

  await animal.save();
};

exports.createVetAction = catchAsync(async (req, res, next) => {
  req.body.animal = req.params.animalId;
  req.body.user = req.user._id;
  req.body.category = 'action';
  req.body.farm = req.user.farm;


  const action = await Vet.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      action
    }
  })
});

exports.editVetAction = catchAsync(async (req, res, next) => {
  const action = await Vet.findByIdAndUpdate(req.params.actionId, req.body);

  action.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await action.save();

  res.status(201).json({
    status: 'success',
    data: {
      action
    }
  })
});

exports.deleteVetAction = catchAsync(async (req, res, next) => {
  const action = await Vet.findByIdAndDelete(req.params.actionId);

  res.status(203).json({
    status: 'success',
  })
});

exports.createVetProblem = catchAsync(async (req, res, next) => {
  req.body.animal = req.params.animalId;
  req.body.user = req.user._id;
  req.body.category = 'problem';
  req.body.cured = false;
  req.body.farm = req.user.farm;

  const problem = await Vet.create(req.body);

  this.changeAnimalHealthStatus(problem.animal);

  res.status(201).json({
    status: 'success',
    data: {
      problem
    }
  })
});

exports.editVetProblem = catchAsync(async (req, res, next) => {
  const problem = await Vet.findByIdAndUpdate(req.params.problemId, req.body);

  problem.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await problem.save();

  res.status(201).json({
    status: 'success',
    data: {
      problem
    }
  })
});

exports.deleteVetProblem = catchAsync(async (req, res, next) => {
  const problem = await Vet.findByIdAndDelete(req.params.problemId);

  res.status(203).json({
    status: 'success'
  })
});

exports.createVetScheduledAction = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.scheduled = true;
  req.body.farm = req.user.farm;
  const action = await Vet.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      action
    }
  })
});

exports.addTreatment = catchAsync(async (req, res, next) => {
  req.body.disease = req.params.diseaseId;
  req.body.user = req.user._id;
  req.body.farm = req.user.farm;
  req.body.category = 'treatment';

  const treatment = await Vet.create(req.body);
  const disease = await Vet.findById(treatment.disease)

  if (req.body.cured) {
    disease.cured = true;
    await disease.save();
  }

  this.changeAnimalHealthStatus(disease.animal);


  res.status(201).json({
    status: 'success',
    data: {
      treatment
    }
  })
});

exports.editVetTreatment = catchAsync(async (req, res, next) => {
  const treatment = await Vet.findByIdAndUpdate(req.params.treatmentId, req.body);

  treatment.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await treatment.save();

  res.status(201).json({
    status: 'success',
    data: {
      treatment
    }
  })
});

exports.deleteVetTreatment = catchAsync(async (req, res, next) => {
  const treatment = await Vet.findByIdAndUpdate(req.params.treatmentId);

  res.status(203).json({
    status: 'success'
  })
});

exports.createScheme = catchAsync(async (req, res, next) => {
  req.body.farm = req.user.farm;
  req.body.user = req.user._id;
  const scheme = await Scheme.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      scheme
    }
  });
});

exports.useScheme = catchAsync(async (req, res, next) => {
  let scheduledSchemeActions = []
  const scheme = await Scheme.findById(req.body.schemeId);
  let body = {
    name: scheme.points[0].action,
    schemeStarter: true,
    scheme: scheme._id,
    category: 'scheme',
    user: req.user._id,
    animal: req.params.animalId,
    farm: req.user.farm,
    date: req.body.date,
    finished: false
  }
  const firstAction = await Vet.create(body);

  let prevPointDate = firstAction.date;

  scheme.points.forEach(async (point, index, array) => {
    if (!point.firstPoint) {
      let date;
      let timeInHours = point.timeUnit === 'h' ? point.scheduledIn : point.scheduledIn * 24;
      if (point.countFrom === 'last-point') {
        date = new Date(prevPointDate.getTime() + timeInHours * 60 * 60 * 1000);
      } else {
        date = new Date(firstAction.date.getTime() + timeInHours * 60 * 60 * 1000);
      }

      prevPointDate = date;

      let vetAction = {
        firstSchemeAction: firstAction._id,
        scheduled: true,
        name: point.action,
        category: 'scheme',
        scheme: scheme._id,
        date,
        user: req.user._id,
        animal: req.params.animalId
      }

      let schemeAction = await Vet.create(vetAction);
      scheduledSchemeActions.push(schemeAction);
    }

  });

  res.status(201).json({
    status: 'success',
    data: {
      firstAction,
      scheduledSchemeActions
    }
  });
});

exports.deleteScheme = catchAsync(async (req, res, next) => {
  let firstSchemeAction = await Vet.findByIdAndDelete(req.params.firstSchemeAction);
  let otherPoints = await Vet.deleteMany({ firstSchemeAction: req.params.firstSchemeAction });

  res.status(203).json({
    status: 'success'
  });
});

exports.editStartedScheme = catchAsync(async (req, res, next) => {
  let scheduledSchemeActions = []
  let prevPoints = await Vet.deleteMany({ firstSchemeAction: req.params.firstSchemeAction });

  const scheme = await Scheme.findById(req.body.schemeId);

  let firstAction = await Vet.findById(req.params.firstSchemeAction);
  firstAction.name = scheme.points[0].action;
  firstAction.scheme = scheme._id;
  firstAction.date = new Date(req.body.date);
  firstAction.finished = false;

  await firstAction.save();

  let prevPointDate = firstAction.date;

  scheme.points.forEach(async (point, index, array) => {
    if (!point.firstPoint) {
      let date;
      let timeInHours = parseFloat(point.timeUnit === 'h' ? point.scheduledIn : point.scheduledIn * 24);
      if (point.countFrom === 'last-point') {
        date = new Date(prevPointDate.getTime() + timeInHours * 60 * 60 * 1000);
      } else {
        date = new Date(firstAction.date.getTime() + timeInHours * 60 * 60 * 1000);
      }

      prevPointDate = date;

      let vetAction = {
        firstSchemeAction: firstAction._id,
        scheduled: true,
        name: point.action,
        category: 'scheme',
        scheme: scheme._id,
        date,
        user: req.user._id,
        animal: req.params.animalId
      }

      let schemeAction = await Vet.create(vetAction);
      scheduledSchemeActions.push(schemeAction);
    }

  });

  res.status(201).json({
    status: 'success',
    data: {
      firstAction,
      scheduledSchemeActions
    }
  });
});

exports.editScheme = catchAsync(async (req, res, next) => {
  const scheme = await Scheme.findById(req.params.schemeId);

  scheme.points = [];

  scheme.name = req.body.name;
  scheme.points = req.body.points;

  scheme.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await scheme.save();

  res.status(200).json({
    status: 'success',
    data: {
      scheme
    }
  });
});

exports.getStartedScheme = catchAsync(async (req, res, next) => {
  let scheme = await Vet.findById(req.params.schemeId).populate('otherPoints').populate('animal').populate('scheme');

  res.status(200).json({
    status: 'success',
    data: {
      scheme
    }
  });
});

exports.getVetProblem = catchAsync(async(req, res, next) => {
  let problem = await Vet.findById(req.params.id).populate('animal').populate('treatments');

  res.status(200).json({
    status: 'success',
    data: {
      problem
    }
  });
});

exports.autoFinishScheme = catchAsync(async(req, res, next) => {
  const schemes = await Vet.find({ schemeStarter: true, finished: { $ne: true } }).populate('otherPoints').populate('animal').populate('scheme');

  schemes.forEach(async (scheme) => {
    scheme.otherPoints.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    if(new Date() < new Date(scheme.otherPoints[0].date)) return;

    scheme.finished = true;
    await scheme.save();
  });
}); 


