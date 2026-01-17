import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, ArrowLeft, Video, Phone, User, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { createAppointment } from '../api';
import type { Doctor } from '../types';

const BookingConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { doctor, date, slot } = location.state as { doctor: Doctor; date: Date; slot: string } || {};
    const [symptoms, setSymptoms] = useState('');
    const [consultType, setConsultType] = useState<'in-person' | 'video' | 'phone'>('in-person');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [appointmentId, setAppointmentId] = useState('');

    if (!doctor) {
        return (
            <div className="text-center py-12 max-w-md mx-auto">
                <div className="bg-red-50 p-8 rounded-xl">
                    <p className="text-red-600 text-lg font-medium">No booking details found.</p>
                    <button
                        onClick={() => navigate('/doctors')}
                        className="mt-4 bg-gov-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gov-blue-700"
                    >
                        Find a Doctor
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirm = async () => {
        setIsBooking(true);
        try {
            const response = await createAppointment({
                doctor: doctor._id,
                appointmentDate: format(date, 'yyyy-MM-dd'),
                timeSlot: {
                    start: slot,
                    end: slot // Backend can calculate end time
                },
                consultationType: consultType,
                symptoms: symptoms
            });
            const createdAppointment = response.data.data || response.data;
            setAppointmentId(createdAppointment.appointmentNumber || createdAppointment._id);
            setIsConfirmed(true);
        } catch (error) {
            console.error("Booking failed", error);
            alert("Booking failed. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gov-blue-700">Booking Confirmed!</h1>
                <p className="text-gray-500 text-lg">Your appointment has been successfully scheduled.</p>

                <div className="bg-white p-8 rounded-xl border border-gov-blue-100 shadow-sm text-left max-w-md mx-auto mt-8">
                    <p className="text-sm text-gray-500 mb-1">Appointment Reference</p>
                    <p className="font-mono font-bold text-gov-blue-700 text-lg mb-6">{appointmentId}</p>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Doctor</span>
                            <span className="font-medium text-gray-900">{doctor.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Specialization</span>
                            <span className="font-medium text-gray-900">{doctor.specialization}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium text-gray-900">{format(date, 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium text-gray-900">{slot}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Consultation Type</span>
                            <span className="font-medium text-gray-900 capitalize">{consultType}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/appointments')}
                        className="bg-gov-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gov-blue-700 transition-colors"
                    >
                        My Appointments
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="border border-gov-blue-600 text-gov-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gov-blue-50 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gov-blue-500 hover:text-gov-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>

            <h1 className="text-3xl font-bold text-gov-blue-700">Confirm Booking</h1>

            {/* Doctor Summary */}
            <div className="bg-white p-6 rounded-xl border border-gov-blue-100 shadow-sm flex gap-6">
                <div className="w-20 h-20 bg-gov-blue-50 rounded-full flex-shrink-0 flex items-center justify-center text-gov-blue-600">
                    <Stethoscope className="h-10 w-10" />
                </div>
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gov-blue-700">{doctor.name}</h2>
                    <p className="text-gov-blue-600">{doctor.specialization}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gov-blue-500" />
                            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>{slot}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>Main Building</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gov-blue-700">₹{doctor.consultationFee}</p>
                </div>
            </div>

            {/* Consultation Type */}
            <div className="bg-white p-6 rounded-xl border border-gov-blue-100 shadow-sm">
                <h3 className="font-bold text-gov-blue-700 mb-4">Consultation Type</h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { type: 'in-person' as const, icon: User, label: 'In-Person', desc: 'Visit the hospital' },
                        { type: 'video' as const, icon: Video, label: 'Video Call', desc: 'Online consultation' },
                        { type: 'phone' as const, icon: Phone, label: 'Phone Call', desc: 'Audio consultation' },
                    ].map(({ type, icon: Icon, label, desc }) => (
                        <button
                            key={type}
                            onClick={() => setConsultType(type)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${consultType === type
                                ? 'border-gov-blue-600 bg-gov-blue-50'
                                : 'border-gray-200 hover:border-gov-blue-300'
                                }`}
                        >
                            <Icon className={`h-8 w-8 mx-auto mb-2 ${consultType === type ? 'text-gov-blue-600' : 'text-gray-400'}`} />
                            <p className={`font-medium ${consultType === type ? 'text-gov-blue-700' : 'text-gray-700'}`}>{label}</p>
                            <p className="text-xs text-gray-500 mt-1">{desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Symptoms */}
            <div className="bg-white p-6 rounded-xl border border-gov-blue-100 shadow-sm">
                <h3 className="font-bold text-gov-blue-700 mb-4">Symptoms / Reason for Visit</h3>
                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Please describe your symptoms or reason for this appointment..."
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 focus:border-transparent outline-none resize-none h-32"
                />
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={isBooking}
                    className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all ${isBooking
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gov-blue-600 hover:bg-gov-blue-700 shadow-lg'
                        }`}
                >
                    {isBooking ? 'Booking...' : 'Confirm Appointment'}
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;
