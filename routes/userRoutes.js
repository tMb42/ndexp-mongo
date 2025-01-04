const express = require('express');
const userClr = require('../controllers/userController');


const router = express.Router();

// router.route('/users').get(userClr.getAllUsers);

router.route('/users').get(userClr.getAllUsers);
router.route('/users/:id').get(userClr.getUserById);
router.route('/users').post(userClr.createUser);
router.route('/users/:id').put(userClr.updateUser);




module.exports = router;