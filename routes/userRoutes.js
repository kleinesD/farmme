const express = require("express")
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.patch('/edit-user/:id', authController.protect, userController.editUser);

router.post('/create-user-link', authController.protect, authController.createUserLink);

router.get('/check-email/:email', userController.checkEmail)


module.exports = router;
