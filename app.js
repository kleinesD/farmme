const express = require('express');
const path = require('path')
const cookieParser = require('cookie-parser');

const farmRouter = require('./routes/farmRoutes');
const userRouter = require('./routes/userRoutes');
const animalRouter = require('./routes/animalRoutes');
const vetRouter = require('./routes/vetRoutes');
const calendarRouter = require('./routes/calendarRoutes');
const inventoryRouter = require('./routes/inventoryRoutes');
const distributionRouter = require('./routes/distributionRoutes');
const feedRouter = require('./routes/feedRoutes');
const milkQualityRouter = require('./routes/milkQualityRoutes');
const notificationRouter = require('./routes/notificationRouter');
const viewRouter = require('./routes/viewRoutes');
const errorController = require('./controllers/errorController')

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(cookieParser())

app.use('/api/farms', farmRouter);
app.use('/api/users', userRouter);
app.use('/api/animals', animalRouter);
app.use('/api/vet', vetRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/distribution', distributionRouter);
app.use('/api/feed', feedRouter);
app.use('/api/milk-quality', milkQualityRouter);
app.use('/api/notifications', notificationRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

module.exports = app;