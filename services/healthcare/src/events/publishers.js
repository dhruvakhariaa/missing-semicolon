/**
 * Event Publishers
 * Publish events to RabbitMQ for other services to consume
 */

const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Publish when a new appointment is created
const publishAppointmentCreated = async (appointment, patient, doctor, department) => {
    try {
        await publishEvent('appointment.created', {
            appointmentId: appointment._id,
            appointmentNumber: appointment.appointmentNumber,
            patientId: patient._id,
            patientName: patient.name,
            patientEmail: patient.email,
            doctorId: doctor._id,
            doctorName: doctor.name,
            departmentId: department._id,
            departmentName: department.name,
            appointmentDate: appointment.appointmentDate,
            timeSlot: appointment.timeSlot,
            type: appointment.type
        });
        logger.debug('Published appointment.created event');
    } catch (error) {
        logger.error('Failed to publish appointment.created:', error);
    }
};

// Publish when an appointment is cancelled
const publishAppointmentCancelled = async (appointment, patient) => {
    try {
        await publishEvent('appointment.cancelled', {
            appointmentId: appointment._id,
            appointmentNumber: appointment.appointmentNumber,
            patientId: patient._id,
            patientEmail: patient.email,
            doctorId: appointment.doctor,
            appointmentDate: appointment.appointmentDate,
            reason: appointment.cancellationReason
        });
        logger.debug('Published appointment.cancelled event');
    } catch (error) {
        logger.error('Failed to publish appointment.cancelled:', error);
    }
};

// Publish when a new patient registers
const publishPatientRegistered = async (patient) => {
    try {
        await publishEvent('patient.registered', {
            patientId: patient._id,
            userId: patient.userId,
            name: patient.name,
            email: patient.email,
            phone: patient.phone
        });
        logger.debug('Published patient.registered event');
    } catch (error) {
        logger.error('Failed to publish patient.registered:', error);
    }
};

module.exports = {
    publishAppointmentCreated,
    publishAppointmentCancelled,
    publishPatientRegistered
};
