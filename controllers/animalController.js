const moment = require('moment');
const Animal = require('../models/animalModel');
const Farm = require('../models/farmModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

let updateCurrentInfoOneAnimal = catchAsync(async (animal) => {
  if (animal.gender === 'female') {
    let lastLact = animal.lactations.at(-1);
    let lastInsem = animal.inseminations.at(-1);

    /* Empty current info if nothing happens */
    animal.currentInfoAB.message = ``;
    animal.currentInfoAB.status = 'regular';

    /* Regular lactation info */
    if (lastLact && lastLact.finishDate === null) {
      animal.currentInfoAB.message = `Лактация: ${lastLact.number} | День: ${Math.round((Date.now() - lastLact.startDate.getTime()) / 1000 / 60 / 60 / 24)}`;
      animal.currentInfoAB.status = 'regular';
    }

    /* Insemination info */
    if (lastLact) {
      if (lastLact && !lastInsem || lastInsem.date > lastLact.startDate && !lastInsem.success || lastInsem.date < lastLact.startDate) {
        if (Date.now() < lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000 && Date.now() >= lastLact.startDate.getTime() + 30 * 24 * 60 * 60 * 1000) {
          animal.currentInfoAB.message = `Пора осеменять через: ${Math.round(((lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000) - Date.now()) / 1000 / 60 / 60 / 24)} дн.`;
          animal.currentInfoAB.status = 'on-schedule';
        } else if (Date.now() > lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000) {
          animal.currentInfoAB.message = `Перестой: ${Math.round((Date.now() - (lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000)) / 1000 / 60 / 60 / 24)} дн.`;
          animal.currentInfoAB.status = 'urgent';
        }
      }
    }

    if (!lastLact && !lastInsem || !lastLact && !lastInsem.success) {
      if (Date.now() < animal.birthDate.getTime() + 15 * 30 * 24 * 60 * 60 * 1000 && Date.now() >= animal.birthDate.getTime() + 14 * 30 * 24 * 60 * 60 * 1000) {
        animal.currentInfoAB.message = `Пора осеменять`;
        animal.currentInfoAB.status = 'on-schedule';
      } else if (Date.now() > animal.birthDate.getTime() + 15 * 30 * 24 * 60 * 60 * 1000) {
        animal.currentInfoAB.message = `Пора осеменять`;
        animal.currentInfoAB.status = 'urgent';
      }
    }

    if (lastInsem && lastInsem.success === undefined) {
      animal.currentInfoAB.message = `Не подтвержденное осеменение: ${Math.round((Date.now() - lastInsem.date.getTime()) / 1000 / 60 / 60 / 24)} дн. назад`;
      animal.currentInfoAB.status = 'regular';
    }

    /* Calving info */
    if (lastInsem && lastInsem.success) {
      if (!lastLact || lastInsem.date > lastLact.startDate) {
        if (Date.now() > lastInsem.date.getTime() + 223 * 24 * 60 * 60 * 1000) {
          animal.currentInfoAB.message = `Отел через: ${Math.round(((lastInsem.date.getTime() + 283 * 24 * 60 * 60 * 1000) - Date.now()) / 1000 / 60 / 60 / 24)} дн.`;
          animal.currentInfoAB.status = 'on-schedule';
        }
      }
    }

    await animal.save();
  } else if (animal.gender === 'male') {
    /* Empty current info if nothing happens */
    animal.currentInfoAB.message = ``;
    animal.currentInfoAB.status = 'regular';

    await animal.save();
  }
})

exports.getAllAnimals = catchAsync(async (req, res, next) => {
  const animals = await Animal.find();

  res.status(200).json({
    status: 'success',
    counter: animals.length,
    data: {
      animals
    }
  });
});

exports.getOneAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.getAnimalByNumber = catchAsync(async (req, res, next) => {
  const animal = await Animal.findOne({ farm: req.user.farm, number: req.params.number });
  if (!animal) return false;

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.addOneAnimal = catchAsync(async (req, res, next) => {
  req.body.farm = req.user.farm;
  const animal = await Animal.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateOneAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findByIdAndUpdate(req.params.animalId, req.body);

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.addLactation = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  let animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { lactations: req.body } });

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { lactations: { $each: [], $sort: { startDate: 1 } } } });

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateLactation = catchAsync(async (req, res, next) => {
  let animal = await Animal.findById(req.params.animalId);

  animal.lactations[req.params.index].startDate = req.body.startDate;
  animal.lactations[req.params.index].finishDate = req.body.finishDate;
  animal.lactations[req.params.index].number = req.body.number;

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { lactations: { $each: [], $sort: { startDate: 1 } } } });

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.deleteLactation = catchAsync(async (req, res, next) => {
  const lactation = await Animal.find({ _id: req.params.animalId }, { lactations: { $elemMatch: { _id: req.params.id } } });
  let lactationNumber = lactation[0].lactations[0].number
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { lactations: { _id: req.params.id } } })
  /* const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { lactations: { _id: req.params.id },  milkingResults: { lactationNumber: lactationNumber } } }) */

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});

exports.addMilkingResult = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { milkingResults: req.body } });

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateMilkingResult = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);

  animal.milkingResults[req.params.index].lactationNumber = req.body.lactationNumber;
  animal.milkingResults[req.params.index].date = req.body.date;
  animal.milkingResults[req.params.index].result = req.body.result;

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.deleteMilkingResult = catchAsync(async (req, res, next) => {
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { milkingResults: { _id: req.params.id } } })

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});

exports.addWeightResult = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { weightResults: req.body } });

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateWeightResult = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);

  animal.weightResults[req.params.index].date = req.body.date;
  animal.weightResults[req.params.index].result = req.body.result;

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.deleteWeightResult = catchAsync(async (req, res, next) => {
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { weightResults: { _id: req.params.id } } })

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});

exports.addInsemination = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  let animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { inseminations: req.body } });

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { inseminations: { $each: [], $sort: { date: 1 } } } });

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateInsemination = catchAsync(async (req, res, next) => {
  let animal = await Animal.findById(req.params.animalId);

  if (req.body.date) animal.inseminations[req.params.index].date = req.body.date;
  if (req.body.success) animal.inseminations[req.params.index].success = req.body.success;
  if (req.body.type) animal.inseminations[req.params.index].type = req.body.type;
  if (req.body.bull) animal.inseminations[req.params.index].bull = req.body.bull;

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { inseminations: { $each: [], $sort: { date: 1 } } } });


  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.deleteInsemination = catchAsync(async (req, res, next) => {
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { inseminations: { _id: req.params.id } } })

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});

exports.updateCurrentInfo = catchAsync(async (req, res, next) => {
  let cows = await Animal.find({ gender: 'female' });
  let bulls = await Animal.find({ gender: 'male' });

  cows.forEach(async (cow) => {
    let lastLact = cow.lactations.at(-1);
    let lastInsem = cow.inseminations.at(-1);

    /* Empty current info if nothing happens */
    cow.currentInfoAB.message = ``;
    cow.currentInfoAB.status = 'regular';

    /* Regular lactation info */
    if (lastLact && lastLact.finishDate === null) {
      cow.currentInfoAB.message = `Лактация: ${lastLact.number} | День: ${Math.round((Date.now() - lastLact.startDate.getTime()) / 1000 / 60 / 60 / 24)}`;
      cow.currentInfoAB.status = 'regular';
    }

    /* Insemination info */
    if (lastLact) {
      if (lastLact && !lastInsem || lastInsem.date > lastLact.startDate && !lastInsem.success || lastInsem.date < lastLact.startDate) {
        if (Date.now() < lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000 && Date.now() >= lastLact.startDate.getTime() + 30 * 24 * 60 * 60 * 1000) {
          cow.currentInfoAB.message = `Пора осеменять через: ${Math.round(((lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000) - Date.now()) / 1000 / 60 / 60 / 24)} дн.`;
          cow.currentInfoAB.status = 'on-schedule';
        } else if (Date.now() > lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000) {
          cow.currentInfoAB.message = `Перестой: ${Math.round((Date.now() - (lastLact.startDate.getTime() + 60 * 24 * 60 * 60 * 1000)) / 1000 / 60 / 60 / 24)} дн.`;
          cow.currentInfoAB.status = 'urgent';
        }
      }
    }

    if (!lastLact && !lastInsem || !lastLact && !lastInsem.success) {
      if (Date.now() < cow.birthDate.getTime() + 15 * 30 * 24 * 60 * 60 * 1000 && Date.now() >= cow.birthDate.getTime() + 14 * 30 * 24 * 60 * 60 * 1000) {
        cow.currentInfoAB.message = `Пора осеменять`;
        cow.currentInfoAB.status = 'on-schedule';
      } else if (Date.now() > cow.birthDate.getTime() + 15 * 30 * 24 * 60 * 60 * 1000) {
        cow.currentInfoAB.message = `Пора осеменять`;
        cow.currentInfoAB.status = 'urgent';
      }
    }

    if (lastInsem && lastInsem.success === undefined) {
      cow.currentInfoAB.message = `Не подтвержденное осеменение: ${Math.round((Date.now() - lastInsem.date.getTime()) / 1000 / 60 / 60 / 24)} дн. назад`;
      cow.currentInfoAB.status = 'regular';
    }

    /* Calving info */
    if (lastInsem && lastInsem.success) {
      if (!lastLact || lastInsem.date > lastLact.startDate) {
        if (Date.now() < lastInsem.date.getTime() + 223 * 24 * 60 * 60 * 1000) {
          cow.currentInfoAB.message = `Отел через: ${Math.round(((lastInsem.date.getTime() + 283 * 24 * 60 * 60 * 1000) - Date.now()) / 1000 / 60 / 60 / 24)} дн.`;
          cow.currentInfoAB.status = 'on-schedule';
        }
      }
    }

    await cow.save();
  });

  bulls.forEach(async (bull) => {
    /* Empty current info if nothing happens */
    bull.currentInfoAB.message = ``;
    bull.currentInfoAB.status = 'regular';

    await bull.save();
  });

  let animals = await Animal.find();

  /* animals.forEach(async (animal) => {
    if(true) {
      animal.mainPhoto = 'default-cow-image.png'

      await animal.save()
    }
  }); */
})

exports.writeOffAnimal = catchAsync(async (req, res, next) => {
  req.body.status = 'diseased';

  const animal = await Animal.findByIdAndUpdate(req.params.animalId, req.body);

  /* Change the balance in accounting block */

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.writeOffMultipleAnimals = catchAsync(async (req, res, next) => {
  let allAnimals = [];
  const animalsObjects = req.body.animalsObjects;

  animalsObjects.forEach(async obj => {
    obj.body.status = 'diseased';

    let animal = await Animal.findByIdAndUpdate(obj.animalId, obj.body);

    allAnimals.push(animal);
  });

  /* Change the balance in accounting block */

  res.status(200).json({
    status: 'success',
    data: {
      allAnimals
    }
  })
});

exports.bringBackAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);

  animal.status = 'alive';
  animal.writeOffDate = undefined;
  animal.writeOffReason = undefined;
  animal.writeOffMoneyReceived = undefined;
  animal.writeOffNote = undefined;
  await animal.save();
  /* Do something to extract money received from the farm account */

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.milkingProjectionData = catchAsync(async (req, res, next) => {
  let animal = await Animal.findById(req.params.animalId);
  let farmAnimals = await Animal.find({ farm: animal.farm, gender: 'female' });
  let allAnimals = await Animal.find({ gender: 'female' })

  res.status(200).json({
    status: 'success',
    data: {
      animal,
      farmAnimals,
      allAnimals
    }
  });
});

exports.checkAnimalByField = catchAsync(async (req, res, next) => {
  let animal;
  if (req.params.field === 'number') animal = await Animal.findOne({ number: req.params.value });
  if (req.params.field === 'name') animal = await Animal.findOne({ name: req.params.value });

  let exist = false;
  if (animal) exist = true;

  res.status(200).json({
    status: 'success',
    data: {
      exist
    }
  })
});

exports.getAnimalByCategory = catchAsync(async (req, res, next) => {
  let animals;
  if (req.params.category !== 'all') {
    animals = await Animal.find({ farm: req.user.farm, category: req.params.category });
  } else {
    animals = await Animal.find({ farm: req.user.farm, $or: [{ category: { $exists: false } }, { category: 'all' }, { catrgory: null }] })
  }
  res.status(200).json({
    status: 'success',
    data: {
      animals
    }
  });
});

exports.addNote = catchAsync(async (req, res, next) => {
  let animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { notes: req.body } });

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { notes: { $each: [], $sort: { date: 1 } } } });

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateNote = catchAsync(async (req, res, next) => {
  let animal = await Animal.findById(req.params.animalId);

  animal.notes[req.params.index].text = req.body.text;
  animal.notes[req.params.index].date = req.body.date;

  animal.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await animal.save();

  animal = await Animal.findOneAndUpdate({ _id: req.params.animalId }, { $push: { notes: { $each: [], $sort: { date: 1 } } } });

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.deleteNote = catchAsync(async (req, res, next) => {
  const note = await Animal.find({ _id: req.params.animalId }, { notes: { $elemMatch: { _id: req.params.id } } });
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { notes: { _id: req.params.id } } })

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});


