import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { createAppointment } from '../api';

const BookingConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { doctor, date, slot } = location.state || {};
    const [symptoms, setSymptoms] = useState('');
    const [consultType, setConsultType] = useState('in-person');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    if (!doctor) {
        return <div className="text-center py-12">No booking details found.</div>;
    }

    const handleConfirm = async () => {
        setIsBooking(true);
        try {
            await createAppointment({
                doctorId: doctor.id,
                date: format(date, 'yyyy-MM-dd'),
                time: slot, // "10:00 AM"
                type: consultType,
                reason: symptoms
            });
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
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
                <p className="text-gray-500 text-lg">Your appointment has been successfully scheduled.</p>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left max-w-md mx-auto mt-8">
                    <p className="text-sm text-gray-500 mb-1">Appointment ID</p>
                    <p className="font-mono font-bold text-gray-900 mb-4">APT202601170984</p>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Doctor</span>
                            <span className="font-medium text-gray-900">{doctor.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium text-gray-900">{format(date, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium text-gray-900">{slot}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button
                        onClick={() => navigate('/appointments')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        My Appointments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Summary */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-4">Appointment Summary</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-blue-700">Doctor</p>
                                <div className="font-medium text-blue-900 flex items-center gap-2">
                                    <span className="text-xl">👨‍⚕️</span> {doctor.name}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-blue-700">Department</p>
                                <div className="font-medium text-blue-900">{doctor.specialization}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-blue-700">Date & Time</p>
                                <div className="font-medium text-blue-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> {format(date, 'EEE, MMM d')}
                                    <span className="mx-1">•</span>
                                    <Clock className="h-4 w-4" /> {slot}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-blue-700">Consultation Fee</p>
                                <div className="font-medium text-blue-900">₹{doctor.fee}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Consultation Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConsultType('in-person')}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${consultType === 'in-person'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <MapPin className="h-6 w-6" />
                                    <span className="font-medium">In-Person Visit</span>
                                </button>
                                <button
                                    onClick={() => setConsultType('video')}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${consultType === 'video'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl">📹</div>
                                    <span className="font-medium">Video Consult</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Symptoms / Reason for Visit <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                rows={4}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={isBooking}
                        className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-transform active:scale-[0.99] shadow-lg hover:shadow-xl ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isBooking ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
