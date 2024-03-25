const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const Animal = require('../models/animalModel');
const Calendar = require('../models/calendarModel');
const Vet = require('../models/vetModel');
const moment = require('moment');
const randomstring = require('randomstring');

exports.updateNotification = catchAsync(async (req, res, next) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      notif
    }
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notif = await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success'
  });
});

exports.notificationCreator = catchAsync(async () => {
  /* Check for inseminations */
  const cows = await Animal.find({ gender: 'female' });

  let insemsubId = randomstring.generate(12);
  cows.forEach(async cow => {
    let lastInsem = cow.inseminations.at(-1) ? cow.inseminations.at(-1).success : false;

    if (!cow.birthDate && cow.lactations.length === 0 || cow.birthDate && new Date() < new Date(moment(cow.birthDate).add(18, 'month'))) return;


    if (cow.lactations.length > 0 && lastInsem && cow.lactations.at(-1).startDate < cow.inseminations.at(-1).date) return;

    if (cow.lactations.length > 0 && new Date(moment(cow.lactations.at(-1).startDate).add(50, 'day')) > new Date()) return;

    if (await Notification.findOne({ expandId: `${cow._id}-soon-to-insem` })) return;

    await Notification.create({
      subId: insemsubId,
      farm: cow.farm,
      expandId: `${cow._id}-soon-to-insem`,
      notifierId: cow._id.toString(),
      notifierModel: 'Animal',
      notifyAt: new Date(),
      title: 'Пора осеменять',
      link: `/herd/animal-card/${cow._id}`,
      module: 'herd',
      icon: 'herd-s.svg',
      animal: cow._id
    });
  });

  /* Check for calvings */
  let herdsubId = randomstring.generate(12);
  cows.forEach(async cow => {

    if (cow.inseminations.length === 0 || !cow.inseminations.at(-1).success) return;

    if (cow.lactations.length === 0 || new Date(cow.lactations.at(-1).startDate) < new Date(cow.inseminations.at(-1).date) && new Date() > new Date(moment(cow.inseminations.at(-1).date).add(253, 'day'))) {
      if (await Notification.findOne({ expandId: `${cow._id}-soon-to-calv` })) return;

      await Notification.create({
        subId: herdsubId,
        farm: cow.farm,
        expandId: `${cow._id}-soon-to-calv`,
        notifierId: cow._id.toString(),
        notifierModel: 'Animal',
        notifyAt: new Date(),
        title: 'Скоро отел',
        link: `/herd/animal-card/${cow._id}`,
        module: 'herd',
        icon: 'herd-s.svg',
        animal: cow._id
      });
    }
  });

  /* Check for scheme steps ahead */
  const schemesubId = randomstring.generate(12);
  const points = await Vet.find({ category: 'scheme', date: { $gt: new Date(), $lt: new Date(moment().add(1, 'day')) } }).populate({ path: 'firstSchemeAction', populate: { path: 'animal' } });

  points.forEach(async point => {
    if (await Notification.findOne({ expandId: `${point._id}-scheme-step` })) return;

    await Notification.create({
      subId: schemesubId,
      farm: point.firstSchemeAction.animal.farm,
      expandId: `${point._id}-scheme-step`,
      notifierId: point._id.toString(),
      notifierModel: 'Vet',
      notifyAt: new Date(),
      title: point.name,
      link: `/herd/animal-card/${point.firstSchemeAction.animal._id}`,
      module: 'vet',
      icon: 'vet-s.svg',
      animal: point.firstSchemeAction.animal._id
    });
  });


  /* Check for uncured problems */
  const vetsubId = randomstring.generate(12);
  const uncuredProblems = await Vet.find({ category: 'problem', cured: false }).populate('animal');
  
  uncuredProblems.forEach(async problem => {
    if (await Notification.findOne({ expandId: `${problem.animal._id}-uncured-problem` })) return;
    
    await Notification.create({
      subId: vetsubId,
      farm: problem.animal.farm,
      expandId: `${problem.animal._id}-uncured-problem`,
      notifierId: problem.animal._id.toString(),
      notifierModel: 'Vet',
      notifyAt: new Date(),
      title: 'Невылеченные проблемы',
      link: `/herd/animal-card/${problem.animal._id}`,
      module: 'vet',
      icon: 'vet-s.svg',
      animal: problem.animal._id
    });
  });
  
  /* Check for reminders */
  const remindersubId = randomstring.generate(12);
  const reminders = await Calendar.find({ date: { $lt: new Date(moment().add(1, 'day')) }, module: {$ne: 'order'} });

  reminders.forEach(async rem => {
    if (await Notification.findOne({ expandId: `${rem._id}-reminder` })) return;
    
    await Notification.create({
      subId: remindersubId,
      farm: rem.farm,
      expandId: `${rem._id}-reminder`,
      notifierId: rem._id.toString(),
      notifierModel: 'Calendar',
      notifyAt: new Date(),
      title: rem.name,
      link: `/calendar/`,
      module: 'calendar',
      icon: 'calendar-s.svg'
    });
  });

  /* Delete expired notifications */
  const expiredNotifications = await Notification.deleteMany({ deleteAt: { $lt: new Date() } });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ farm: req.user.farm, notifyAt: { $lt: Date.now() }, show: { $ne: false } }).populate('animal');

  res.status(200).json({
    status: 'success',
    data: {
      notifications
    }
  });
});