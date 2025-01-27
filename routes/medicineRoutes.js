const express = require('express');
const router = express.Router();
const medicationClr = require('../controllers/medicineController');
const verifyToken = require('../middleware/verifyJwtToken');


router.route('/cpanel/savedMedicine').post(verifyToken, medicationClr.saveMedicineDetails);
router.route('/cpanel/medicines').get(verifyToken, medicationClr.getAllMedicines);
router.route('/cpanel/med/:id').get(verifyToken, medicationClr.getMedicineDetailsById);
router.route('/cpanel/updateMed').post(verifyToken, medicationClr.updateMedicineById);
router.route('/cpanel/searchMed').post(verifyToken, medicationClr.searchMedicineDetails);


module.exports = router;
