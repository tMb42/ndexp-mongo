const express = require('express');
const authClr = require('../controllers/authController');
// const verifyToken = require('../middleware/verifyJwtToken');
const verifyPaToken = require('../middleware/verifyPersonalAccessToken');
// const verifyPatWaToken = require('../middleware/verifyPersonalAccessTokenWithAbilities');

const router = express.Router();


router.route('/register').post(authClr.signUp);
router.route('/login').post(authClr.signIn);
router.route('/logout').post(verifyPaToken, authClr.signOut);
router.route('/email/verify/:userId/:token').get(authClr.verifyEmail);
router.route('/userDetails').get(verifyPaToken, authClr.getAuthUserDetails);


module.exports = router;
