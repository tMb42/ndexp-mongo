const express = require('express');
const router = express.Router();
const authClr = require('../controllers/authController');
const verifyToken = require('../middleware/verifyJwtToken');





router.route('/register').post(authClr.signUp);
router.route('/login').post(authClr.signIn);
router.route('/logout').post(verifyToken, authClr.signOut);
router.route('/email/verify/:userId/:token').get(authClr.verifyEmail);
router.route('/userDetails').get(verifyToken, authClr.getAuthUserDetails);
router.route('/profile').put(verifyToken, authClr.updateUserProfile);
router.route('/address').put(verifyToken, authClr.userAddressUpdate);



module.exports = router;
