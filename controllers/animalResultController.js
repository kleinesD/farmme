const AnimalResult = require('../models/animalResultModel');
const Animal = require('../models/animalModel');
const Vet = require('../models/vetModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addAnimalResult = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.farm = req.user.farm;

  const result = await AnimalResult.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      result
    }
  });
});

exports.editAnimalResult = catchAsync(async (req, res, next) => {
  const result = await AnimalResult.findByIdAndUpdate(req.params.id, req.body);

  result.editedAtBy.push({
    date: new Date(),
    user: req.user._id
  });

  await result.save();

  res.status(200).json({
    status: 'success',
    data: {
      result
    }
  });
});

exports.deleteAnimalResult = catchAsync(async (req, res, next) => {

  const result = await AnimalResult.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success'
  });
});

exports.moveResults = catchAsync(async () => {
  /* const results = await AnimalResult.find().populate('lactation');

  results.forEach(async res => {

    if (res.type === 'milking') {
      const animal = await Animal.findByIdAndUpdate(res.animal, {
        $push: {
          milkingResults: {
            creationDate: res.creationDate,
            date: res.date,
            result: res.result,
            lactationNumber: res.lactation.lactationNumber,
            note: res.note,
            subId: res.subId,
            user: res.user
          }
        }
      })
    } else if (res.type === 'weight') {
      const animal = await Animal.findByIdAndUpdate(res.animal, {
        $push: {
          weightResults: {
            creationDate: res.creationDate,
            date: res.date,
            result: res.result,
            user: res.user
          }
        }
      })
    } else if (res.type === 'lactation') {
      const animal = await Animal.findByIdAndUpdate(res.animal, {
        $push: {
          lactations: {
            creationDate: res.creationDate,
            startDate: res.startDate,
            finishDate: res.finishDate,
            result: res.result,
            number: res.lactationNumber,
            user: res.user
          }
        }
      })
    }
  }); */
  /* const animals = await Animal.find();
  animals.forEach(async animal => {
    animal.inseminations = undefined;
    await animal.save();
  });

  const inseminations = await Vet.find({ category: 'insemination' });
  console.log(inseminations.length);

  inseminations.forEach(async (insem, inx) => {
    const animal = await Animal.findByIdAndUpdate(insem.animal, {
      $push: {
        inseminations: {
          creationDate: insem.creationDate,
          date: insem.date,
          success: insem.inseminationResult,
          type: insem.inseminationType,
          bull: insem.bull,
          user: insem.user
        }
      }
    })

    if(animal) console.log(inseminations.length - inx);
  }); */

});