const express = require('express');
const router = express.Router();
const patientClr = require('../controllers/patientController');
const appointmentClr = require('../controllers/appointmentController');
const verifyToken = require('../middleware/verifyJwtToken');


router.route('/create-app').post(verifyToken, appointmentClr.createAppointment);
router.route('/delete-app').post(verifyToken, appointmentClr.deleteAppointment);
router.route('/cancel-app').post(verifyToken, appointmentClr.cancelScheduleAppointment);
router.route('/resche-app').post(verifyToken, appointmentClr.rescheduleAppointment);
router.route('/bookedSlot').post(verifyToken, appointmentClr.getBookedTimeSlot);
router.route('/appointment').get(verifyToken, appointmentClr.getAllAppointments);
router.route('/searchBooking').post(verifyToken, appointmentClr.searchBookingDetails);
router.route('/updateStatus').put(verifyToken, appointmentClr.updateAppointmentStatus);
// router.route('/update-app').put(verifyToken, patientClr.updateAppointmentStatus);
// router.route('/check-conflict').post(verifyToken, patientClr.updateAppointmentStatus);
router.route('/newPatient').post(verifyToken, patientClr.createPatient);
router.route('/patients').get(verifyToken, patientClr.getAllPatientDetails);
router.route('/doctors').get(verifyToken, patientClr.getAllDoctors);
router.route('/ptns').get(verifyToken, patientClr.getNeverAppointedPatients);
router.route('/scheduledPtns').post(verifyToken, patientClr.getAllScheduledPatients);
router.route('/nonSchPtns').post(verifyToken, patientClr.getAllNonScheduledPatients);
router.route('/savedCaseHistory').post(verifyToken, patientClr.savePatientsCaseHistory);
router.route('/caseHistories').post(verifyToken, patientClr.getPatientsAllCaseHistory);
router.route('/editPatient').put(verifyToken, patientClr.editPatientInformation);




module.exports = router;