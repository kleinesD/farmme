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

exports.renderLogin = catchAsync(async (req, res, next) => {
  //-const cows = await Animal.find({ farm: '628c8bc53108dae81ddad028', gender: 'female' });
  res.status(200).render('login', {
    /* cows */
  });
});

exports.renderMain = catchAsync(async (req, res, next) => {
  const cows = await Animal.find({ gender: 'female', farm: req.user.farm });

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
  if (reminder.animal) {
    animal = await Animal.findById(reminder.animal);
  }

  res.status(200).render('generalReminder', {
    reminder,
    animal,
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
  const user = await User.findByIdAndUpdate(req.user._id, req.body);

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
  const potMother = await Animal.find({ gender: 'female' });
  const potFather = await Animal.find({ farm: req.user.farm, gender: 'male' });

  res.status(200).render('herdAddAnimal', {
    potMother,
    potFather
  });
});

exports.renderEditAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
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

  res.status(200).render('herdLactation', {
    animal,
    animals,
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
  let animals = [];
  if (req.query.filter === 'all') {
    animals = await Animal.find({ farm: req.user.farm });
  } else if (req.query.filter === 'bulls') {
    animals = await Animal.find({ farm: req.user.farm, gender: 'male' });
  } else if (req.query.filter === 'cows') {
    animals = await Animal.find({ farm: req.user.farm, gender: 'female' });
  } else if (req.query.filter === 'calfs') {
    animals = await Animal.find({ farm: req.user.farm, birthDate: { $lte: new Date(moment().subtract(1, 'year')) } });
  }


  res.status(200).render('herdAllAnimals', {
    animals,
    filter: req.query.filter
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

  res.status(200).render('herdWriteOffAnimal', {
    forOne,
    animal,
    animals
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

  res.status(200).render('vetAction', {
    forOne,
    animal,
    animals,
    forEdit
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

  res.status(200).render('vetProblem', {
    forOne,
    animal,
    animals,
    forEdit
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
  const animal = await Animal.findById(req.params.animalId);
  const schemes = await Scheme.find({ farm: req.user.farm });

  res.status(200).render('vetStartScheme', {
    animal,
    schemes,
    forEdit
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
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem' });
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment' });

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

exports.renderVetHistory = catchAsync(async (req, res, next) => {
  let actions = await Vet.find({ farm: req.user.farm, category: 'action', scheduled: false });
  let problems = await Vet.find({ farm: req.user.farm, category: 'problem', scheduled: false });
  let treatments = await Vet.find({ farm: req.user.farm, category: 'treatment', scheduled: false });


  res.status(200).render('vetHistory', {
    actions,
    problems,
    treatments
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
  const orders = await Calendar.find({ subId: req.params.id }).populate('client');

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
  const products = await Product.find({ farm: req.user.farm }).populate('client').populate('rawProduct').populate('produced').populate('user').sort('-date');

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
    meatTotal
  });
});

exports.renderAllClients = catchAsync(async (req, res, next) => {
  let startDate = req.query.start ? new Date(req.query.start) : new Date(moment().subtract(1, 'month'));
  let endDate = req.query.end ? new Date(req.query.end) : new Date();

  const clients = await Client.find({ farm: req.user.farm });
  const products = await Product.find({ client: { $exists: true }, farm: req.user.farm, date: { $gte: startDate, $lte: endDate } });




  res.status(200).render('distAllClients', {
    clients,
    products,
    startDate,
    endDate
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
  let startDate = req.query.start ? new Date(req.query.start) : new Date(moment().subtract(1, 'month'));
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
