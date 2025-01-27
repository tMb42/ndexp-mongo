const express = require('express');
const router = express.Router();
const userClr = require('../controllers/userController');


router.route('/users').get(userClr.getAllUsers);
router.route('/users/:id').get(userClr.getUserById);
router.route('/users').post(userClr.createUser);
router.route('/users/:id').put(userClr.updateUser);


module.exports = router;