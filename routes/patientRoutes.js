const express = require('express');
const router = express.Router();
const patientClr = require('../controllers/patientController');
const appointmentClr = require('../controllers/appointmentController');
const verifyToken = require('../middleware/verifyJwtToken');


router.route('/create-app').post(verifyToken, appointmentClr.createAppointment);
router.route('/update-app').put(verifyToken, patientClr.updateAppointmentStatus);
router.route('/check-conflict').post(verifyToken, patientClr.updateAppointmentStatus);
router.route('/ceate').get(verifyToken, patientClr.getAppointments);
router.route('/ceate').get(verifyToken, patientClr.getPatientDetails);
router.route('/doctors').get(verifyToken, patientClr.getAllDoctors);



module.exports = router;