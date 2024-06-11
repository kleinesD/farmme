const fs = require('fs');
const moment = require('moment')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Animal = require('../models/animalModel');
const Farm = require('../models/farmModel');
const User = require('../models/userModel');
const Vet = require('../models/vetModel');
const Scheme = require('../models/schemeModel');
const Calendar = require('../models/calendarModel');
const Inventory = require('../models/inventoryModel');
const Client = require('../models/clientModel');
const Product = require('../models/productModel');
const Feed = require('../models/feedModel');
const MilkQuality = require('../models/milkQualityModel');
const AnimalResult = require('../models/animalResultModel');

exports.renderLogin = catchAsync(async (req, res, next) => {
  //-const cows = await Animal.find({ farm: '628c8bc53108dae81ddad028', gender: 'female' });
  res.status(200).render('login', {
    /* cows */
  });
});

exports.renderMain = catchAsync(async (req, res, next) => {
  const data = {};

  const animals = await Animal.find({ farm: req.user.farm, status: 'alive' });
  const cows = await Animal.find({ farm: req.user.farm, gender: 'female', status: 'alive' });
  const bulls = await Animal.find({ farm: req.user.farm, gender: 'male', status: 'alive' });

  data.milkingCows = 0;
  data.inseminatedCows = 0;
  data.bullsReady = 0;
  data.soonToCalv = 0;
  data.calves = 0;
  data.animals = animals;
  data.cows = cows;
  data.bulls = bulls;

  animals.forEach(animal => {
    if (Date.now() < animal.birthDate.getTime() + 18 * 30 * 24 * 60 * 60 * 1000) data.calves++;
  });

  cows.forEach(cow => {
    if (cow.lactations.length > 0 && cow.lactations[cow.lactations.length - 1].finishDate === null) data.milkingCows++;
    if (cow.inseminations.length > 0 && cow.inseminations[cow.inseminations.length - 1].success) {
      if (cow.lactations.length === 0 || cow.inseminations[cow.inseminations.length - 1].date > cow.lactations[cow.lactations.length - 1].startDate) {
        data.inseminatedCows++
        if (cow.inseminations[cow.inseminations.length - 1].date.getTime() > cow.inseminations[cow.inseminations.length - 1].date.getTime() + 225 * 24 * 60 * 60 * 1000) data.soonToCalv++;
      }
    }

  });

  bulls.forEach(bull => {
    if ((bull.birthDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000) > Date.now()) data.bullsReady++;
  });

  const problems = await Vet.find({ category: 'problem', cured: { $ne: true } });


  res.status(200).render('main', {
    data,
    cows,
    problems
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
  const reminder = await Calendar.findById(req.params.reminderId).populate('animal');

  res.status(200).render('generalReminder', {
    reminder,
    forEdit
  });
});

exports.renderEditFarm = catchAsync(async (req, res, next) => {
  const farm = await Farm.findOne({ owner: req.user._id });

  res.status(200).render('editFarm', {
    farm
  });
});

exports.renderEditUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id);

  res.status(200).render('editUser', {
    user
  })
});

exports.renderChangeRestrictions = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ farm: req.user.farm, _id: req.params.userId });

  res.status(200).render('changeRestrictions', {
    user
  });
});

exports.renderAllEmployees = catchAsync(async (req, res, next) => {
  const farm = await Farm.findById(req.params.farmId);
  const users = await User.find({ farm: farm._id, _id: { $ne: farm.owner } });

  res.status(200).render('allEmployees', {
    users
  });
});

exports.renderDataHandler = catchAsync(async (req, res, next) => {

});

exports.renderReports = catchAsync(async (req, res, next) => {

  res.status(200).render('reports', {

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
  const data = {};

  const animals = await Animal.find({ farm: req.user.farm, status: 'alive' });
  const cows = await Animal.find({ farm: req.user.farm, gender: 'female', status: 'alive' });
  const bulls = await Animal.find({ farm: req.user.farm, gender: 'male', status: 'alive' });

  data.milkingCows = 0;
  data.inseminatedCows = 0;
  data.bullsReady = 0;
  data.soonToCalv = 0;
  data.calves = 0;
  data.animals = animals;
  data.cows = cows;
  data.bulls = bulls;

  animals.forEach(animal => {
    if (Date.now() < animal.birthDate.getTime() + 18 * 30 * 24 * 60 * 60 * 1000) data.calves++;
  });

  cows.forEach(cow => {
    if (cow.lactations.length > 0 && cow.lactations[cow.lactations.length - 1].finishDate === null) data.milkingCows++;
    if (cow.inseminations.length > 0 && cow.inseminations[cow.inseminations.length - 1].success) {
      if (cow.lactations.length === 0 || cow.inseminations[cow.inseminations.length - 1].date > cow.lactations[cow.lactations.length - 1].startDate) {
        data.inseminatedCows++
        if (cow.inseminations[cow.inseminations.length - 1].date.getTime() > cow.inseminations[cow.inseminations.length - 1].date.getTime() + 225 * 24 * 60 * 60 * 1000) data.soonToCalv++;
      }
    }

  });

  bulls.forEach(bull => {
    if ((bull.birthDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000) > Date.now()) data.bullsReady++;
  })

  const tableData = {
    soonToCalv: [],
    soonToInsem: [],
    firstInsem: []
  };

  cows.forEach(cow => {
    const lactAmount = cow.lactations.length;
    const insemAmount = cow.inseminations.length;
    let lastInsemRes = false;
    let lastInsem;
    let lastLact;
    if (insemAmount > 0) {
      lastInsemRes = cow.inseminations[cow.inseminations.length - 1].success;
      lastInsem = cow.inseminations[cow.inseminations.length - 1];
    }
    if (lactAmount > 0) {
      lastLact = cow.lactations[cow.lactations.length - 1];
    }
    // Adding firts calv
    if (lactAmount === 0 && !lastInsemRes && new Date() > new Date(moment(cow.birthDate).add(18, 'months'))) tableData.firstInsem.push(cow)

    // Adding soon to calv
    if (lactAmount === 0 && lastInsemRes || lactAmount > 0 && insemAmount > 0 && lastInsem.date > lastLact.startDate && lastInsemRes) tableData.soonToCalv.push(cow);

    // Adding soon to insem
    if (lactAmount > 0 && insemAmount > 0 && !lastInsemRes && new Date() > new Date(moment(lastLact.startDate).add(60, 'days')) || lactAmount > 0 && lastInsemRes && lastInsem.date < lastLact.date) tableData.soonToInsem.push(cow);

  });

  /* Getting top animals */
  const topAnimals = [];

  cows.forEach(cow => {
    if (cow.milkingResults.length === 0) return;
    let total = 0;
    cow.milkingResults.forEach(result => {
      total += result.result;
    });

    topAnimals.push({
      cow,
      result: parseFloat((total / cow.milkingResults.length).toFixed(1))
    });
  });

  topAnimals.sort((a, b) => b.result - a.result);
  let topAnimalsFormated = topAnimals.slice(0, 10);

  /* Getting recent results */
  let monthsResults = [];

  cows.forEach(cow => {
    cow.milkingResults.forEach(result => {
      if (monthsResults.find(el => moment(el.date).isSame(result.date, 'month'))) {
        let monthRes = monthsResults.find(el => moment(el.date).isSame(result.date, 'month'));

        monthRes.results.push(result.result);
        monthRes.dayTotal += result.result;
        monthRes.monthTotal = monthRes.dayTotal * 30
        monthRes.average = parseFloat((monthRes.dayTotal / monthRes.results.length).toFixed(1))
      } else {
        monthsResults.push({
          date: result.date,
          results: [result.result],
          dayTotal: result.result,
          average: result.result,
          monthTotal: result.result
        })
      }
    });
  });
  monthsResults.sort((a, b) => b.date - a.date);
  let lastMonthsResult = monthsResults[0];

  res.status(200).render('herdMain', {
    animals,
    cows,
    bulls,
    data,
    tableData,
    topAnimalsFormated,
    lastMonthsResult
  });
});

exports.renderHerdAddAnimal = catchAsync(async (req, res, next) => {
  const potMother = await Animal.find({ farm: req.user.farm, gender: 'female' });
  const potFather = await Animal.find({ farm: req.user.farm, gender: 'male' });

  const motherId = req.query.mother ? req.query.mother : undefined;

  res.status(200).render('herdAddAnimal', {
    potMother,
    potFather,
    motherId
  });
});

exports.renderEditAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId).populate('mother').populate('father');
  const farm = await Farm.findById(animal.farm);

  const potMother = await Animal.find({ farm: req.user.farm, gender: 'female', _id: { $ne: animal._id } });
  const potFather = await Animal.find({ farm: req.user.farm, gender: 'male', _id: { $ne: animal._id } });

  res.status(200).render('herdEditAnimal', {
    animal,
    farm,
    potMother,
    potFather
  });
});

exports.renderEditDeadBirth = catchAsync(async (req, res, next) => {
  const animal = await Animal.findOne({ _id: req.params.animalId, status: 'dead-birth' });
  const potMother = await Animal.find({ farm: req.user.farm, gender: 'female' });
  const potFather = await Animal.find({ farm: req.user.farm, gender: 'male' });

  res.status(200).render('herdEditDeadBirth', {
    animal,
    potMother,
    potFather
  });
});

exports.renderAddMilkingResults = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({ farm: req.user.farm });

  res.status(200).render('herdMilkingResults', {
    animal,
    animals,
    forEdit
  });
});

exports.renderAddWeightResults = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({ farm: req.user.farm });

  res.status(200).render('herdWeightResults', {
    animal,
    animals,
    forEdit
  });
});

exports.renderAddLactation = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const animals = await Animal.find({ farm: req.user.farm });
  animal.lactations.sort((a, b) => new Date(a.startDate) - new Date(b.date));

  let unfinishedLactation = animal.lactations.find(lact => !lact.finishDate);
  unfinishedLactation.index = animal.lactations.indexOf(unfinishedLactation);
  
  res.status(200).render('herdLactation', {
    animal,
    animals,
    unfinishedLactation,
    forEdit
  });
});

exports.renderAddInsemination = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const animal = await Animal.findById(req.params.animalId);
  const bulls = await Animal.find({ farm: req.user.farm, gender: 'male' });

  res.status(200).render('herdInsemination', {
    animal,
    bulls,
    forEdit
  });
});

exports.renderAllAnimals = catchAsync(async (req, res, next) => {
  let farm = await Farm.findById(req.user.farm);
  let animals = [];
  if (req.query.filter === 'all') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive' });
  } else if (req.query.filter === 'bulls') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive', gender: 'male' });
  } else if (req.query.filter === 'cows') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive', gender: 'female', birthDate: { $lte: new Date(moment().subtract(18, 'month')) }, 'lactations.0': { $exists: true } });
  } else if (req.query.filter === 'heifers') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive', gender: 'female', birthDate: { $lte: new Date(moment().subtract(18, 'month')) }, lactations: { $size: 0 } });
  } else if (req.query.filter === 'calves') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive', birthDate: { $gte: new Date(moment().subtract(1, 'year')) } });
  } else if (req.query.filter === 'diseased') {
    animals = await Animal.find({ farm: req.user.farm, status: { $ne: 'alive' }, });
  } else if (req.query.filter === 'slaughter') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive', butcherSuggestion: true });
  }



  res.status(200).render('herdAllAnimals', {
    animals,
    farm,
    filter: req.query.filter
  });
});

exports.renderAnimalCard = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
  const calves = await Animal.find({ mother: animal._id });
  const farm = await Farm.findById(req.user.farm);
  const allFarmAnimals = await Animal.find({ farm: animal.farm });
  let lastInsem, lastLact;
  if (animal.inseminations.length > 0) lastInsem = animal.inseminations[animal.inseminations.length - 1];
  if (animal.lactations.length > 0) lastLact = animal.lactations[animal.lactations.length - 1];
  const scheme = await Vet.findOne({ animal: animal._id, schemeStarter: true, finished: { $ne: true } }).populate('otherPoints').populate('animal').populate('scheme');
  const problems = await Vet.find({ animal: animal._id, category: 'problem' }).populate('treatments');

  animal.lactations.sort((a, b) => a.number - b.number);
  animal.weightResults.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).render('herdAnimalCard', {
    animal,
    calves,
    allFarmAnimals,
    lastInsem,
    lastLact,
    scheme,
    problems,
    farm
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
  const animals = await Animal.find({ farm: req.user.farm });

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
  const animals = await Animal.find({ farm: req.user.farm });

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

  const bulls = await Animal.find({ gender: 'male' });

  const insemination = animal.inseminations[req.params.index];

  const index = req.params.index;


  res.status(200).render('herdInsemination', {
    forEdit,
    animal,
    insemination,
    index,
    bulls,
  });
});

exports.renderEditLactation = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const animal = await Animal.findById(req.params.animalId);
  animal.lactations.sort((a, b) => new Date(a.startDate) - new Date(b.date));

  const lactation = animal.lactations[req.params.index];

  const index = req.params.index;

  res.status(200).render('herdLactation', {
    animal,
    lactation,
    index,
    forEdit
  });
});

exports.renderListMilkingResults = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm, gender: 'female' });
  const date = new Date();

  res.status(200).render('herdListAddMilkingResults', {
    animals,
    date
  });
});

exports.renderListInseminations = catchAsync(async (req, res, next) => {
  const animals = await Animal.find({ farm: req.user.farm, gender: 'female' });
  const bulls = await Animal.find({ farm: req.user.farm, gender: 'male' });

  res.status(200).render('herdListAddInseminations', {
    animals,
    bulls
  });
});

exports.renderWriteOffAnimal = catchAsync(async (req, res, next) => {
  let forOne = req.params.animalId !== 'multiple';
  let animal, animals;
  if (req.params.animalId === 'multiple') {
    animals = await Animal.find({ farm: req.user.farm, status: 'alive' });
  } else {
    animal = await Animal.findById(req.params.animalId);
  }

  let selectedAnimals = [];
  if (req.query.animals) {
    selectedAnimals = req.query.animals.split(',');
  }

  const clients = await Client.find({ farm: req.user.farm });

  res.status(200).render('herdWriteOffAnimal', {
    forOne,
    animal,
    animals,
    selectedAnimals,
    clients
  });
});

exports.renderHerdHistory = catchAsync(async (req, res, next) => {
  let animals = await Animal.find({ farm: req.user.farm });


  res.status(200).render('herdHistory', {
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

  let selectedAnimals = [];
  if (req.query.animals) {
    selectedAnimals = req.query.animals.split(',');
  }

  res.status(200).render('vetAction', {
    forOne,
    animal,
    animals,
    forEdit,
    selectedAnimals
  });
});

exports.renderEditVetAction = catchAsync(async (req, res, next) => {
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

  let selectedAnimals = [];
  if (req.query.animals) {
    selectedAnimals = req.query.animals.split(',');
  }
  res.status(200).render('vetProblem', {
    forOne,
    animal,
    animals,
    forEdit,
    selectedAnimals
  });
});

exports.renderEditVetProblem = catchAsync(async (req, res, next) => {
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

exports.renderEditVetTreatment = catchAsync(async (req, res, next) => {
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
  const forEdit = false;

  res.status(200).render('vetScheme', {
    forEdit
  });
});

exports.renderEditScheme = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const scheme = await Scheme.findById(req.params.schemeId);

  res.status(200).render('vetScheme', {
    scheme,
    forEdit
  });
});

exports.renderStartVetScheme = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const schemes = await Scheme.find({ farm: req.user.farm });

  let animal, animals, forOne;
  if (req.params.animalId !== 'multiple') {
    animal = await Animal.findById(req.params.animalId);
    forOne = true;
  } else {
    animals = await Animal.find({ farm: req.user.farm, gender: 'female' });
    forOne = false;
  }

  let selectedAnimals = [];
  if (req.query.animals) {
    selectedAnimals = req.query.animals.split(',');
  }
  res.status(200).render('vetStartScheme', {
    schemes,
    forEdit,
    animal,
    animals,
    forOne,
    selectedAnimals
  });
});

exports.renderEditStartedVetScheme = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const firstSchemeAction = await Vet.findById(req.params.firstSchemeAction).populate('scheme');

  const schemes = await Scheme.find({ farm: req.user.farm });

  const animal = await Animal.findById(firstSchemeAction.animal);

  res.status(200).render('vetStartScheme', {
    firstSchemeAction,
    schemes,
    animal,
    forEdit
  })
});

exports.renderVetMain = catchAsync(async (req, res, next) => {
  let actions = await Vet.find({ farm: req.user.farm, category: 'action' });
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem' }).populate('animal');
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment' });

  let schemes = await Vet.find({ farm: req.user.farm, schemeStarter: true }).populate('otherPoints').populate('animal').populate('scheme');
  let uncuredProblems = await Vet.find({ farm: req.user.farm, category: 'problem', cured: false }).populate('animal');
  let sickAnimalsCount = 0;
  let rusEndChange = false;
  let problemsFormated = []
  problems.forEach(prob => {
    if (new Date(prob.date) < new Date(moment().subtract(1, 'year'))) return;

    if (problemsFormated.find(probBuf => probBuf.animal.number === prob.animal.number)) {
      problemsFormated.find(probBuf => probBuf.animal.number === prob.animal.number).count++;
    } else {
      problemsFormated.push({
        animal: prob.animal,
        count: 1
      })
      sickAnimalsCount++;
    }
  });

  if (sickAnimalsCount.toString().split('')[sickAnimalsCount.toString().length - 1] == 1) rusEndChange = true;


  /* From HERD BLOCK */
  const cows = await Animal.find({ farm: req.user.farm, gender: 'female', status: 'alive' });
  const tableData = {
    soonToCalv: [],
    soonToInsem: [],
    firstInsem: []
  };

  cows.forEach(cow => {
    const lactAmount = cow.lactations.length;
    const insemAmount = cow.inseminations.length;
    let lastInsemRes = false;
    let lastInsem;
    let lastLact;
    if (insemAmount > 0) {
      lastInsemRes = cow.inseminations[cow.inseminations.length - 1].success;
      lastInsem = cow.inseminations[cow.inseminations.length - 1];
    }
    if (lactAmount > 0) {
      lastLact = cow.lactations[cow.lactations.length - 1];
    }
    // Adding firts calv
    if (lactAmount === 0 && !lastInsemRes && new Date() > new Date(moment(cow.birthDate).add(18, 'months'))) tableData.firstInsem.push(cow)

    // Adding soon to calv
    if (lactAmount === 0 && lastInsemRes || lactAmount > 0 && insemAmount > 0 && lastInsem.date > lastLact.startDate && lastInsemRes) tableData.soonToCalv.push(cow);

    // Adding soon to insem
    if (lactAmount > 0 && insemAmount > 0 && !lastInsemRes && new Date() > new Date(moment(lastLact.startDate).add(60, 'days')) || lactAmount > 0 && lastInsemRes && lastInsem.date < lastLact.date) tableData.soonToInsem.push(cow);
  });

  /* counting animal insemination attemps */
  let totalInsem = 0;
  let insemFormated = [];
  cows.forEach((cow) => {
    let streak = 1;
    cow.inseminations.forEach((insem, inx, arr) => {
      if (insem.success) {
        if (insemFormated.find(el => el.attemps === streak)) {
          insemFormated.find(el => el.attemps === streak).count++;
        } else {
          insemFormated.push({
            attemps: streak,
            count: 1
          })
        }
        streak = 1;
        totalInsem++;
      } else {
        streak++;
      }

    });
  });

  insemFormated.forEach(insem => {
    insem.percent = Math.round(insem.count * (100 / totalInsem));
  });
  insemFormated.sort((a, b) => a.attemps - b.attemps);

  /* Getting current schemes */
  let currentSchemes = [];
  schemes.forEach(scheme => {
    if (new Date(scheme.otherPoints[scheme.otherPoints.length - 1].date) > new Date()) currentSchemes.push(scheme)
  });
  schemes.sort((a, b) => b.date - a.date)

  res.status(200).render('vetMain', {
    actions,
    problems,
    treatments,
    schemes,
    uncuredProblems,
    problemsFormated,
    sickAnimalsCount,
    rusEndChange,
    tableData,
    insemFormated,
    currentSchemes
  });
});

exports.renderVetHistory = catchAsync(async (req, res, next) => {
  let actions = await Vet.find({ farm: req.user.farm, category: 'action', scheduled: false }).populate('animal').populate('user');
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem', scheduled: false }).populate('animal').populate('user');
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment', scheduled: false }).populate('user').populate({ path: 'disease', populate: { path: 'animal' } });
  let schemes = await Scheme.find({ farm: req.user.farm }).populate('user');
  let schemePoints = await Vet.find({ farm: req.user.farm, category: 'scheme', schemeStarter: true }).populate('animal').populate('user').populate('scheme');

  res.status(200).render('vetHistory', {
    actions,
    problems,
    treatments,
    schemes,
    schemePoints
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
/////////////////
/////////////////
/////////////////
/* DISTRIBUTION BLOCK */
/////////////////
/////////////////
/////////////////

const countInventoryTotal = (arr) => {
  let total = 0;
  arr.forEach(el => {
    if (el.type === 'increase') total += el.size;
    if (el.type === 'decrease') total -= el.size;
  });

  return total;
}

exports.renderAddClient = catchAsync(async (req, res, next) => {
  const forEdit = false;

  res.status(200).render('distClient', {
    forEdit
  });
});

exports.renderEditClient = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const client = await Client.findById(req.params.id);

  res.status(200).render('distClient', {
    forEdit,
    client
  });
});

exports.renderAddProductDecide = catchAsync(async (req, res, next) => {

  res.status(200).render('distProductDecide', {

  });
});

exports.renderAddProduct = catchAsync(async (req, res, next) => {
  const forEdit = false;

  res.status(200).render('distProduct', {
    forEdit
  });
});

exports.renderEditProduct = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const product = await Product.findById(req.params.id);

  res.status(200).render('distProduct', {
    forEdit,
    product
  });
});

exports.renderAddProcess = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const rawInventory = await Product.find({ farm: req.user.farm, product: req.params.product })
  const totalRaw = countInventoryTotal(rawInventory);
  let unitRaw = rawInventory[0].unit;
  let engRaw = req.params.product;
  let rusRaw = '';

  if (req.params.product === 'milk') rusRaw = 'молоко';
  if (req.params.product === 'cottage-cheese') rusRaw = 'творог';
  if (req.params.product === 'cheese') rusRaw = 'сыр';
  if (req.params.product === 'whey') rusRaw = 'сыворотка';
  if (req.params.product === 'cream') rusRaw = 'сливки';
  if (req.params.product === 'butter') rusRaw = 'масло';

  res.status(200).render('distProcess', {
    forEdit,
    totalRaw,
    unitRaw,
    rusRaw,
    engRaw
  });
});

exports.renderEditProcess = catchAsync(async (req, res, next) => {
  const forEdit = true;

  const rawProduct = await Product.findById(req.params.id);
  const rawInventory = await Product.find({ farm: req.user.farm, product: rawProduct.product, _id: { $ne: req.params.id } });
  const totalRaw = countInventoryTotal(rawInventory);

  let engRaw = rawProduct.product;
  let rusRaw = '';

  const products = await Product.find({ rawProduct: req.params.id });

  if (rawProduct.product === 'milk') rusRaw = 'молоко';
  if (rawProduct.product === 'cottage-cheese') rusRaw = 'творог';
  if (rawProduct.product === 'cheese') rusRaw = 'сыр';
  if (rawProduct.product === 'whey') rusRaw = 'сыворотка';
  if (rawProduct.product === 'cream') rusRaw = 'сливки';
  if (rawProduct.product === 'butter') rusRaw = 'масло';

  res.status(200).render('distProcess', {
    forEdit,
    rawProduct,
    products,
    totalRaw,
    engRaw,
    rusRaw
  });
});

exports.renderAddOrder = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const clients = await Client.find({ farm: req.user.farm });

  res.status(200).render('distOrder', {
    forEdit,
    clients
  });
});

exports.renderEditOrder = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const clients = await Client.find({ farm: req.user.farm });
  const orders = await Calendar.find({ subId: req.params.id });

  res.status(200).render('distOrder', {
    forEdit,
    orders,
    clients
  });
});

exports.renderAddSale = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const clients = await Client.find({ farm: req.user.farm });

  const milkTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'milk' }))
  const cottageCheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cottage-cheese' }))
  const creamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cream' }))
  const butterTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'butter' }))
  const wheyTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'whey' }))
  const cheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cheese' }))
  const sourCreamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'sour-cream' }))
  const meatTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'meat' }))

  res.status(200).render('distSale', {
    forEdit,
    clients,
    milkTotal,
    cottageCheeseTotal,
    creamTotal,
    butterTotal,
    wheyTotal,
    cheeseTotal,
    sourCreamTotal,
    meatTotal
  });
});

exports.renderEditSale = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const products = await Product.find({ subId: req.params.id }).populate('client');
  const clients = await Client.find({ farm: req.user.farm });

  const milkTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'milk', subId: { $ne: req.params.id } }))
  const cottageCheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cottage-cheese', subId: { $ne: req.params.id } }))
  const creamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cream', subId: { $ne: req.params.id } }))
  const butterTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'butter', subId: { $ne: req.params.id } }))
  const wheyTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'whey', subId: { $ne: req.params.id } }))
  const cheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cheese', subId: { $ne: req.params.id } }))
  const sourCreamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'sour-cream', subId: { $ne: req.params.id } }))
  const meatTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'meat', subId: { $ne: req.params.id } }))


  res.status(200).render('distSale', {
    forEdit,
    clients,
    products,
    milkTotal,
    cottageCheeseTotal,
    creamTotal,
    butterTotal,
    wheyTotal,
    cheeseTotal,
    sourCreamTotal,
    meatTotal
  });
});

exports.renderAddConsumption = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const milkTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'milk' }))
  const cottageCheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cottage-cheese' }))
  const creamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cream' }))
  const butterTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'butter' }))
  const wheyTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'whey' }))
  const cheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cheese' }))
  const sourCreamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'sour-cream' }))
  const meatTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'meat' }))

  res.status(200).render('distConsumption', {
    forEdit,
    milkTotal,
    cottageCheeseTotal,
    creamTotal,
    butterTotal,
    wheyTotal,
    cheeseTotal,
    sourCreamTotal,
    meatTotal
  });
});

exports.renderEditConsumption = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const products = await Product.find({ subId: req.params.id });

  const milkTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'milk', subId: { $ne: req.params.id } }))
  const cottageCheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cottage-cheese', subId: { $ne: req.params.id } }))
  const creamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cream', subId: { $ne: req.params.id } }))
  const butterTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'butter', subId: { $ne: req.params.id } }))
  const wheyTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'whey', subId: { $ne: req.params.id } }))
  const cheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cheese', subId: { $ne: req.params.id } }))
  const sourCreamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'sour-cream', subId: { $ne: req.params.id } }))
  const meatTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'meat', subId: { $ne: req.params.id } }))


  res.status(200).render('distConsumption', {
    forEdit,
    products,
    milkTotal,
    cottageCheeseTotal,
    creamTotal,
    butterTotal,
    wheyTotal,
    cheeseTotal,
    sourCreamTotal,
    meatTotal
  });
});

exports.renderAddOutgoDecide = catchAsync(async (req, res, next) => {

  res.status(200).render('distOutgoDecide', {

  });
});

exports.renderAllProducts = catchAsync(async (req, res, next) => {
  let startDate = req.query.start ? new Date(req.query.start) : new Date(moment().subtract(12, 'month'));
  let endDate = req.query.end ? new Date(req.query.end) : new Date();
  const products = await Product.find({ farm: req.user.farm, date: { $gte: startDate, $lte: endDate } }).populate('client').populate('rawProduct').populate('produced').populate('user').sort('-date');

  const milkTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'milk' }))
  const cottageCheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cottage-cheese' }))
  const creamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cream' }))
  const butterTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'butter' }))
  const wheyTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'whey' }))
  const cheeseTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'cheese' }))
  const sourCreamTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'sour-cream' }))
  const meatTotal = countInventoryTotal(await Product.find({ farm: req.user.farm, product: 'meat' }))

  res.status(200).render('distAllProducts', {
    products,
    milkTotal,
    cottageCheeseTotal,
    creamTotal,
    butterTotal,
    wheyTotal,
    cheeseTotal,
    sourCreamTotal,
    meatTotal,
    startDate,
    endDate
  });
});

exports.renderAllClients = catchAsync(async (req, res, next) => {
  let startDate = req.query.start ? new Date(req.query.start) : new Date(moment().subtract(1, 'year'));
  let endDate = req.query.end ? new Date(req.query.end) : new Date();

  const clients = await Client.find({ farm: req.user.farm });
  const products = await Product.find({ client: { $exists: true }, farm: req.user.farm, date: { $gte: startDate, $lte: endDate } });
  const sales = await Product.find({ client: { $exists: true }, distributionResult: 'sold', farm: req.user.farm, date: { $gte: startDate, $lte: endDate } });

  let quantityTotal = 0;
  let revenueTotal = 0;
  const clientsFormated = [];
  clients.forEach(client => {
    if (clientsFormated.find(el => el.client.id.toString() === client.id.toString())) return;

    let quantity = { total: 0, count: 0 };
    let revenue = { total: 0, count: 0 };
    sales.forEach(sale => {
      if (sale.client.toString() !== client._id.toString()) return;

      if (sale.size) {
        quantity.total += sale.size;
      }
      if (sale.price) {
        revenue.total += sale.price;
      }
    });

    quantityTotal += quantity.total;
    revenueTotal += revenue.total;

    clientsFormated.push({
      client,
      quantity: parseFloat((quantity.total).toFixed(1)),
      revenue: parseFloat((revenue.total).toFixed(1)),
    })
  });

  clientsFormated.forEach(client => {
    client.shareIndex = parseFloat((((client.quantity / quantityTotal) + (client.revenue / revenueTotal)) * 100 / 2).toFixed(1));
  });

  clientsFormated.sort((a, b) => b.shareIndex - a.shareIndex);


  res.status(200).render('distAllClients', {
    clients,
    products,
    startDate,
    endDate,
    clientsFormated
  });
});

exports.renderAddWriteOff = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const products = await Product.find({ farm: req.user.farm, product: req.params.product })
  const totalProduct = countInventoryTotal(products);
  let unitProduct = products[0].unit;
  let engProduct = req.params.product;
  let rusProduct = '';

  if (req.params.product === 'milk') rusProduct = 'молоко';
  if (req.params.product === 'cottage-cheese') rusProduct = 'творог';
  if (req.params.product === 'cheese') rusProduct = 'сыр';
  if (req.params.product === 'whey') rusProduct = 'сыворотка';
  if (req.params.product === 'cream') rusProduct = 'сливки';
  if (req.params.product === 'butter') rusProduct = 'масло';

  res.status(200).render('distWriteOff', {
    forEdit,
    totalProduct,
    unitProduct,
    rusProduct,
    engProduct
  });
});

exports.renderEditWriteOff = catchAsync(async (req, res, next) => {
  const forEdit = true;

  const product = await Product.findById(req.params.id);
  const products = await Product.find({ farm: req.user.farm, product: product.product, _id: { $ne: req.params.id } });
  const totalProduct = countInventoryTotal(products);

  let engProduct = product.product;
  let rusProduct = '';

  if (product.product === 'milk') rusProduct = 'молоко';
  if (product.product === 'cottage-cheese') rusProduct = 'творог';
  if (product.product === 'cheese') rusProduct = 'сыр';
  if (product.product === 'whey') rusProduct = 'сыворотка';
  if (product.product === 'cream') rusProduct = 'сливки';
  if (product.product === 'butter') rusProduct = 'масло';

  res.status(200).render('distWriteOff', {
    forEdit,
    product,
    products,
    totalProduct,
    engProduct,
    rusProduct
  });
});

exports.renderDistMain = catchAsync(async (req, res, next) => {
  let startDate = req.query.start ? new Date(req.query.start) : new Date(moment().subtract(1, 'year'));
  let endDate = req.query.end ? new Date(req.query.end) : new Date();
  let endDateOrder = req.query.end ? new Date(Date.now(req.query.end)) : new Date(moment().add(1, 'month'));

  let products = await Product.find({ date: { $gte: startDate, $lte: endDate } }).populate('client');
  let orders = await Calendar.find({ module: 'order', date: { $gte: startDate, $lte: endDateOrder } }).populate('client');
  let recOrders = await Calendar.find({ module: 'order', recuring: true }).populate('client');

  res.status(200).render('distMain', {
    products,
    orders,
    recOrders,
    startDate,
    endDate
  });
});

exports.renderDistHistory = catchAsync(async (req, res, next) => {
  const products = await Product.find({ farm: req.user.farm });

  res.status(200).render('distHistory', {
    products
  });
});
/////////////////
/////////////////
/////////////////
/* FEEDING BLOCK */
/////////////////
/////////////////
/////////////////
exports.renderAddFeed = catchAsync(async (req, res, next) => {
  const forEdit = false;

  res.status(200).render('feedSample', {
    forEdit
  });
});

exports.renderEditFeed = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const feed = await Feed.findById(req.params.id);

  res.status(200).render('feedSample', {
    forEdit,
    feed
  });
});

exports.renderAddFeedRecord = catchAsync(async (req, res, next) => {
  const forEdit = false;
  const feedSamples = await Feed.find({ farm: req.user.farm, type: 'sample' });
  const farm = await Farm.findById(req.user.farm);

  res.status(200).render('feedRecord', {
    forEdit,
    feedSamples,
    farm
  });
});

exports.renderEditFeedRecord = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const feed = await Feed.findById(req.params.id).populate('feed');
  const feedSamples = await Feed.find({ farm: req.user.farm, type: 'sample' });
  const farm = await Farm.findById(req.user.farm);

  res.status(200).render('feedRecord', {
    forEdit,
    feed,
    feedSamples,
    farm
  });
});

exports.renderFeedMain = catchAsync(async (req, res, next) => {
  const records = await Feed.find({ farm: req.user.farm, type: 'record' });
  const feeds = await Feed.find({ farm: req.user.farm, type: 'sample' })
  const formated = [];

  feeds.forEach(feed => {
    let obj = {
      id: feed._id,
      name: feed.name,
      type: feed.type,
      category: feed.category,
      unit: feed.unit,
      balance: 0,
      last6Balance: 0,
      max: 0,
      autoAction: undefined,
      records: []
    }

    records.forEach(record => {
      if (record.feed.toString() !== feed._id.toString()) return;

      if (record.status === 'increase') obj.balance += record.amount;
      if (record.status === 'decrease') obj.balance -= record.amount;

      if (record.autoAction && !record.autoActionStop) obj.autoAction = record;

      if (record.date >= new Date(moment().subtract(6, 'month'))) {
        if (record.status === 'increase') obj.last6Balance += record.amount;
        if (record.status === 'decrease') obj.last6Balance -= record.amount;
      }

      if (obj.last6Balance > obj.max) obj.max = obj.last6Balance;
      obj.records.push(record);
    });

    formated.push(obj);
  });

  res.status(200).render('feedMain', {
    records,
    feeds,
    formated
  })
});
/////////////////
/////////////////
/////////////////
/* MILK QUALITY PAGE */
/////////////////
/////////////////
/////////////////
exports.renderAddMilkQuality = catchAsync(async (req, res, next) => {
  const forEdit = false;

  res.status(200).render('milkQuality', {
    forEdit
  });
});
exports.renderEditMilkQuality = catchAsync(async (req, res, next) => {
  const forEdit = true;
  const quality = await MilkQuality.findById(req.params.id);

  res.status(200).render('milkQuality', {
    forEdit,
    quality
  });
});