const express = require('express');
const router = express.Router();
const patientClr = require('../controllers/patientController');
const appointmentClr = require('../controllers/appointmentController');
const verifyToken = require('../middleware/verifyJwtToken');


router.route('/create-app').post(verifyToken, appointmentClr.createAppointment);
router.route('/bookedSlot').post(verifyToken, appointmentClr.getBookedTimeSlot);
router.route('/appointment').get(verifyToken, appointmentClr.getAllAppointments);
router.route('/searchBooking').post(verifyToken, appointmentClr.searchBookingDetails);
router.route('/update-app').put(verifyToken, patientClr.updateAppointmentStatus);
router.route('/check-conflict').post(verifyToken, patientClr.updateAppointmentStatus);
router.route('/patients').get(verifyToken, patientClr.getAllPatientDetails);
router.route('/doctors').get(verifyToken, patientClr.getAllDoctors);
router.route('/ptns').get(verifyToken, patientClr.getAllPatients);
router.route('/scheduledPtns').post(verifyToken, patientClr.getAllSeduledPatients);
router.route('/savedCaseHistory').post(verifyToken, patientClr.savePatientsCaseHistory);
router.route('/caseHistories').post(verifyToken, patientClr.getPatientsAllCaseHistory);



module.exports = router;