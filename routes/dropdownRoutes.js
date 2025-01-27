const express = require('express');
const router = express.Router();
const countryClr = require('../controllers/dropdownController');



router.route('/countries').get(countryClr.getAllCountries);


module.exports = router;