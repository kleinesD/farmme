const dotenv = require('dotenv');
const animalController = require('./controllers/animalController');
const feedController = require('./controllers/feedController');
const vetController = require('./controllers/vetController');
const notificationController = require('./controllers/notificationController');
const isDev = require('electron-is-dev');



dotenv.config({ path: './config.env' });

const app = require('./app');
const server = require('http').createServer(app);
const mongoose = require('mongoose');

if(isDev) {
  const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);
  mongoose.connect(DB).then(con => { console.log('Database connected') })
} else {
  const DB = 'mongodb+srv://kleinesD:gupaba26@cluster0.xdhat.mongodb.net/farmme?retryWrites=true&w=majority'
  mongoose.connect(DB).then(con => { console.log('Database connected') })
}

const port = 604 || 2601;
server.listen(port, () => { console.log(`Server running on port: ${port}`) });

if(isDev) console.log(`Mode: ${process.env.NODE_ENV}`);


animalController.updateCurrentInfo();
feedController.autoAction();
vetController.autoFinishScheme();
notificationController.notificationCreator();
setInterval(() => {
  animalController.updateCurrentInfo()
}, 1 * 60 * 60 * 1000)
setInterval(() => {
  feedController.autoAction();
}, 24 * 60 * 60 * 1000)
module.exports = server;