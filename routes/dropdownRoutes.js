const express = require('express');
const countryClr = require('../controllers/dropdownController');


const router = express.Router();


router.route('/countries').get(countryClr.getAllCountries);


module.exports = router;