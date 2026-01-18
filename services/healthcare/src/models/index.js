/**
 * Models Index - Export all models
 */

const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Department = require('./Department');
const Appointment = require('./Appointment');

module.exports = {
    Patient,
    Doctor,
    Department,
    Appointment
};
