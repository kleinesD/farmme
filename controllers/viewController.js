const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Animal = require('../models/animalModel');
const Vet = require('../models/vetModel');
const Scheme = require('../models/schemeModel');
const Calendar = require('../models/calendarModel');
const Inventory = require('../models/inventoryModel');

exports.renderLogin = catchAsync(async (req, res, next) => {
  const cows = await Animal.find({farm: '622da2b5d88fab5154edd623', gender: 'female'});
  res.status(200).render('login', {
    cows
  });
});

exports.renderMain = catchAsync(async (req, res, next) => {
  const cows = await Animal.find({gender: 'female', farm: req.user.farm});

  res.status(200).render('main', {
    cows
  });
});

exports.renderCalendar = catchAsync(async (req, res, next) => {
  const module = req.query.module;

  res.status(200).render('calendar', {
    module
  });
});

exports.renderAddReminder = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animals = await Animal.find({ farm: req.user.farm });
  
  res.status(200).render('generalReminder', {
    animals,
    forEdit
  });
});

exports.renderEditReminder = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const reminder = await Calendar.findById(req.params.reminderId);
  let animal;
  if(reminder.animal) {
    animal = await Animal.findById(reminder.animal);
  }

  res.status(200).render('generalReminder', {
    reminder,
    animal,
    forEdit
  });
});

/////////////////
/////////////////
/////////////////
/* HERD BLOCK */
/////////////////
/////////////////
/////////////////
exports.renderHerdMain = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm, status: 'alive' });
  const cows = await Animal.find({ farm: req.user.farm, gender: 'female', status: 'alive' });
  const bulls = await Animal.find({ farm: req.user.farm, gender: 'male', status: 'alive' });

  let milkingCows = 0;
  let inseminatedCows = 0;
  let bullsReady = 0;

  cows.forEach(cow => {
    if (cow.lactations.length > 0 && cow.lactations[cow.lactations.length - 1].finishDate === null) milkingCows++;
    if (cow.inseminations.length > 0 && cow.inseminations[cow.inseminations.length - 1].success) {
      if (cow.lactations.length === 0 || cow.inseminations[cow.inseminations.length - 1].date > cow.lactations[cow.lactations.length - 1].startDate) inseminatedCows++
    }
  });

  bulls.forEach(bull => {
    if ((bull.birthDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000) > Date.now()) bullsReady++;
  })

  res.status(200).render('herdMain', {
    animals,
    cows,
    bulls,
    milkingCows, inseminatedCows, bullsReady
  });
});

exports.renderHerdAddAnimal = catchAsync(async (req, res, next) => {
  const potMother = await Animal.find({ gender: 'female', status: 'alive' });
  const potFather = await Animal.find({ gender: 'male', status: 'alive' });

  res.status(200).render('herdAddAnimal', {
    potMother,
    potFather
  });
});

exports.renderAddMilkingResults = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({farm: req.user.farm});

  res.status(200).render('herdMilkingResults', {
    animal,
    animals,
    forEdit
  });
});

exports.renderAddWeightResults = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({farm: req.user.farm});

  res.status(200).render('herdWeightResults', {
    animal,
    animals,
    forEdit
  });
});

exports.renderAddLactation = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({farm: req.user.farm});

  res.status(200).render('herdLactation', {
    animal,
    animals,
    forEdit
  });
});

exports.renderAddInsemination = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const bulls = await Animal.find({ gender: 'male' });

  res.status(200).render('herdInsemination', {
    animal,
    bulls,
    forEdit
  });
});

exports.renderAllAnimals = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm });

  res.status(200).render('herdAllAnimals', {
    animals
  });
});

exports.renderAnimalCard = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
  const allFarmAnimals = await Animal.find({ farm: animal.farm });
  let lastInsem, lastLact;
  if (animal.inseminations.length > 0) lastInsem = animal.inseminations[animal.inseminations.length - 1];
  if (animal.lactations.length > 0) lastLact = animal.lactations[animal.lactations.length - 1];
  const scheme = await Vet.findOne({ animal: animal._id, schemeStarter: true, finished: { $ne: true } }).populate('otherPoints').populate('animal').populate('scheme');
  const problems = await Vet.find({ animal: animal._id, category: 'problem' }).populate('treatments');

  res.status(200).render('herdAnimalCard', {
    animal,
    allFarmAnimals,
    lastInsem,
    lastLact,
    scheme,
    problems
  });
});

exports.renderEditPage = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
  const type = req.params.type;

  res.status(200).render('herdEditPage', {
    animal,
    type
  });
});

exports.renderEditMilkingResults = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({farm: req.user.farm});

  const result = animal.milkingResults[req.params.index];

  const index = req.params.index;

  res.status(200).render('herdMilkingResults', {
    animal,
    result,
    index,
    animals,
    forEdit
  });
});

exports.renderEditWeightResults = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({farm: req.user.farm});

  const result = animal.weightResults[req.params.index];

  const index = req.params.index;

  res.status(200).render('herdWeightResults', {
    animal,
    result,
    index,
    animals,
    forEdit
  });
});

exports.renderEditInsemination = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const animal = await Animal.findById(req.params.animalId).populate({ path: 'inseminations', populate: { path: 'bull', model: 'Animal' } });
  /* const animal = await Animal.findById(req.params.animalId).populate(`inseminations.${req.params.index}.bull`); */
  const bulls = await Animal.find({ gender: 'male' });

  const insemination = animal.inseminations[req.params.index];

  const index = req.params.index;

  res.status(200).render('herdInsemination', {
    animal,
    insemination,
    index,
    bulls,
    forEdit
  });
});

exports.renderEditLactation = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const animal = await Animal.findById(req.params.animalId);

  const lactation = animal.lactations[req.params.index];

  const index = req.params.index;

  res.status(200).render('herdLactation', {
    animal,
    lactation,
    index,
    forEdit
  });
});

exports.renderEditAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);

  const potMother = await Animal.find({ gender: 'female', _id: { $ne: animal._id } });
  const potFather = await Animal.find({ gender: 'male', _id: { $ne: animal._id } });

  res.status(200).render('herdEditAnimal', {
    animal,
    potMother,
    potFather
  });
});

exports.renderListMilkingResults = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm, gender: 'female' });

  res.status(200).render('herdListAddMilkingResults', {
    animals
  });
});

exports.renderListInseminations = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm, gender: 'female' });

  res.status(200).render('herdListAddInseminations', {
    animals
  });
});

exports.renderWriteOffAnimal = catchAsync(async (req, res, next) => {
  let forOne = req.params.animalId !== 'multiple';
  let animal, animals;
  if(req.params.animalId === 'multiple') {
    animals = await Animal.find({farm: req.user.farm, status: 'alive'});
  } else {
    animal = await Animal.findById(req.params.animalId);
  }

  res.status(200).render('herdWriteOffAnimal', {
    forOne,
    animal,
    animals
  });
});


/////////////////
/////////////////
/////////////////
/* VET BLOCK */
/////////////////
/////////////////
/////////////////
exports.renderAddVetAction = catchAsync(async (req, res, next) => {
  const forEdit = false;
  let animal, animals, forOne;
  if (req.params.animalId !== 'multiple') {
    animal = await Animal.findById(req.params.animalId);
    forOne = true;
  } else {
    animals = await Animal.find({ farm: req.user.farm });
    forOne = false;
  }

  res.status(200).render('vetAction', {
    forOne,
    animal,
    animals,
    forEdit
  });
});

exports.renderEditVetAction = catchAsync(async(req, res, next) => {
  const forEdit = true;
  const action = await Vet.findById(req.params.actionId);
  const animal = await Animal.findById(action.animal);

  res.status(200).render('vetAction', {
    action,
    animal,
    forEdit
  });
});

exports.renderAddVetProblem = catchAsync(async (req, res, next) => {
  const forEdit = false;
  let animal, animals, forOne;
  if (req.params.animalId !== 'multiple') {
    animal = await Animal.findById(req.params.animalId);
    forOne = true;
  } else {
    animals = await Animal.find({ farm: req.user.farm });
    forOne = false;
  }

  res.status(200).render('vetProblem', {
    forOne,
    animal,
    animals,
    forEdit
  });
});

exports.renderEditVetProblem = catchAsync(async(req, res, next) => {
  const forEdit = true;
  const problem = await Vet.findById(req.params.problemId);
  const animal = await Animal.findById(problem.animal);

  res.status(200).render('vetProblem', {
    problem,
    animal,
    forEdit
  });
});

exports.renderAddVetTreatment = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const disease = await Vet.findById(req.params.diseaseId);

  let animal = await Animal.findById(disease.animal);

  res.status(200).render('vetTreatment', {
    animal,
    disease,
    forEdit
  });
});

exports.renderEditVetTreatment = catchAsync(async(req, res, next) => {
  const forEdit = true;
  const treatment = await Vet.findById(req.params.treatmentId).populate('disease');
  const animal = await Animal.findById(treatment.disease.animal);

  res.status(200).render('vetTreatment', {
    treatment,
    animal,
    forEdit
  });
});

exports.renderAddVetScheme = catchAsync(async (req, res, next) => {
  
  
  res.status(200).render('vetAddScheme', {

  });
});

exports.renderStartVetScheme = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
  const schemes = await Scheme.find({ farm: req.user.farm });
  
  res.status(200).render('vetStartScheme', {
    animal,
    schemes
  });
});

exports.renderEditStartedVetScheme = catchAsync(async (req, res, next) => {
  const firstSchemeAction = await Vet.findById(req.params.firstSchemeAction).populate('scheme');
  
  const schemes = await Scheme.find({ farm: req.user.farm });

  const animal = await Animal.findById(firstSchemeAction.animal);

  res.status(200).render('vetEditStartedScheme', {
    firstSchemeAction,
    schemes,
    animal
  })
});

exports.renderEditScheme = catchAsync(async (req, res, next) => {
  const scheme = await Scheme.findById(req.params.schemeId);
  
  res.status(200).render('vetEditScheme', {
    scheme
  });
});

exports.renderVetHistory = catchAsync(async (req, res, next) => {
  let actions = await Vet.find({ farm: req.user.farm, category: 'action', scheduled: false });
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem', scheduled: false });
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment', scheduled: false });
  let scheduled = await Vet.find({ farm: req.user.farm, scheduled: true });
  
  
  res.status(200).render('vetHistory', {
    actions,
    problems,
    treatments,
    scheduled
  });
});

exports.renderVetMain = catchAsync(async (req, res, next) => {
  let actions = await Vet.find({ farm: req.user.farm, category: 'action'});
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem'});
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment'});
  
  let schemes = await Vet.find({ farm: req.user.farm, schemeStarter: true }).populate('otherPoints').populate('animal').populate('scheme');
  let uncuredProblems = await Vet.find({ farm: req.user.farm, category: 'problem', cured: false }).populate('treatments').populate('animal');
  
  res.status(200).render('vetMain', {
    actions,
    problems,
    treatments,
    schemes,
    uncuredProblems
  });
});
/////////////////
/////////////////
/////////////////
/* WAREHOUSE BLOCK */
/////////////////
/////////////////
/////////////////
exports.renderAddInventory = catchAsync(async (req, res, next) => {
  const forEdit = false;

  res.status(200).render('warehouseInventory', {
    forEdit
  });
});

exports.renderEditInventory = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const inventory = await Inventory.findById(req.params.inventoryId);

  res.status(200).render('warehouseInventory', {
    forEdit,
    inventory
  });
});