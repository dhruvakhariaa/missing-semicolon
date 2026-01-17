import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { getDoctorById, getDoctorAvailability } from '../api';
import type { Doctor } from '../types';

const DoctorProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return;
            try {
                const res = await getDoctorById(id);
                const docData = res.data.data || res.data;
                // Transform or ensure data matches type
                // The API might return 'slots' or we might need to fetch availability separately
                setDoctor(docData);
                // Initially set generic slots or empty
                setSlots(docData.slots || []);
            } catch (err) {
                console.error("Error fetching doctor", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (id && selectedDate) {
                try {
                    // Format date as YYYY-MM-DD
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const res = await getDoctorAvailability(id, dateStr);
                    setSlots(res.data.slots || res.data || []);
                } catch (e) {
                    console.error("Failed to fetch slots", e);
                    setSlots([]);
                }
            }
        };
        if (selectedDate) {
            fetchAvailability();
        }
    }, [id, selectedDate]);

    const today = startOfToday();
    const nextDays = Array.from({ length: 5 }).map((_, i) => addDays(today, i));

    const handleBook = () => {
        if (doctor && selectedDate && selectedSlot) {
            navigate('/booking-confirmation', {
                state: {
                    doctor,
                    date: selectedDate,
                    slot: selectedSlot
                }
            });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!doctor) return <div>Doctor not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row gap-8">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-4xl">
                        👩‍⚕️
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                                <p className="text-xl text-blue-600">{doctor.specialization}</p>
                            </div>
                            <div className="bg-yellow-50 px-3 py-1 rounded-lg flex items-center gap-1 text-yellow-700 font-bold">
                                <Star className="h-5 w-5 fill-current" />
                                {doctor.rating}
                                <span className="text-gray-400 font-normal text-sm">({doctor.reviews} reviews)</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <span>Cardiology Dept, Main Block</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <span>{doctor.experience} Years Experience</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">About Doctor</h3>
                    <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
                </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>

                {/* Date Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Select Date
                    </label>
                    <div className="flex overflow-x-auto gap-4 pb-2">
                        {nextDays.map((date) => {
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            return (
                                <button
                                    key={date.toString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-shrink-0 w-20 p-3 rounded-xl border text-center transition-all ${isSelected
                                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="text-xs text-gray-500 uppercase font-medium">{format(date, 'EEE')}</div>
                                    <div className="text-lg font-bold mt-1">{format(date, 'd')}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slot Selection */}
                {selectedDate && (
                    <div className="mb-8 animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Available Slots
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {slots.length > 0 ? slots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-3 text-sm rounded-lg border transition-all ${selectedSlot === slot
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                >
                                    {slot}
                                </button>
                            )) : <p className="col-span-full text-gray-500">No slots available for this date.</p>}
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Consultation Fee</p>
                        <p className="text-2xl font-bold text-gray-900">₹{doctor.fee}</p>
                    </div>
                    <button
                        disabled={!selectedDate || !selectedSlot}
                        onClick={handleBook}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${selectedDate && selectedSlot
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Continue to Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
