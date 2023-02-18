const moment = require('moment');
const Animal = require('../models/animalModel');
const Farm = require('../models/farmModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
  const animal = await Animal.findById(req.params.id);

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

  if (req.body.mother) {
    const motherAnimal = await Animal.findByIdAndUpdate(req.body.mother, { $push: { calvings: { child: animal._id, date: animal.birthDate, childCondition: 'alive', withHelp: req.body.withHelp }, lactations: { startDate: animal.birthDate, number: req.body.lactationNumber } } });
  }

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.updateOneAnimal = catchAsync(async (req, res, next) => {
  const animal = await Animal.findByIdAndUpdate(req.params.animalId, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      animal
    }
  });
});

exports.addLactation = catchAsync(async (req, res, next) => {
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
  const animal = await Animal.findByIdAndUpdate({ _id: req.params.animalId }, { $pull: { lactations: { _id: req.params.id } } })

  res.status(203).json({
    status: 'success',
    data: {
      animal
    }
  })
});

exports.addMilkingResult = catchAsync(async (req, res, next) => {
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

  animal.inseminations[req.params.index].date = req.body.date;
  animal.inseminations[req.params.index].success = req.body.success;
  animal.inseminations[req.params.index].type = req.body.type;
  animal.inseminations[req.params.index].bull = req.body.bull;

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
    let lastLact = cow.lactations[cow.lactations.length - 1];
    let lastInsem = cow.inseminations[cow.inseminations.length - 1];

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
        if (Date.now() > lastInsem.date.getTime() + 223 * 24 * 60 * 60 * 1000) {
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
  req.body.status = 'dead';

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
    obj.body.status = 'dead';

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
  let farmAnimals = await Animal.find({farm: animal.farm, gender: 'female'});
  let allAnimals = await Animal.find({gender: 'female'})

  res.status(200).json({
    status: 'success',
    data: {
      animal,
      farmAnimals,
      allAnimals
    }
  });
});


