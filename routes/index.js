const express = require('express');
const router = express.Router();

const authRts = require('./authRoutes');
const userRts = require('./userRoutes');
const dpdnRts = require('./dropdownRoutes');
const ptnRts = require('./patientRoutes');
const medRts = require('./medicineRoutes');


router.use('/', authRts);
router.use('/', userRts);
router.use('/', dpdnRts);
router.use('/', ptnRts);
router.use('/', medRts);



module.exports = router;
