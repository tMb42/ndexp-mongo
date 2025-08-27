const express = require('express');
const router = express.Router();
const dropdnClr = require('../controllers/dropdownController');



router.route('/countries').get(dropdnClr.getAllCountries);
router.route('/sympType').get(dropdnClr.getAllSymptomsType);


module.exports = router;