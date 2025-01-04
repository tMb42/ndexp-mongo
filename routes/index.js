const express = require('express');
const router = express.Router();

const authRts = require('./authRoutes');
const userRts = require('./userRoutes');
const dpdnRts = require('./dropdownRoutes');


router.use('/', authRts);
router.use('/', userRts);
router.use('/', dpdnRts);



module.exports = router;
