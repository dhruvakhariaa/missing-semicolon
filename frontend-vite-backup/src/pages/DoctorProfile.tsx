import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, ArrowLeft, Stethoscope, Phone, Mail } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { getDoctorById, getDoctorAvailability } from '../api';
import type { Doctor } from '../types';

// Slot type from API
interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

const DoctorProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return;
            try {
                const res = await getDoctorById(id);
                const docData = res.data.data || res.data;
                setDoctor(docData);
            } catch (err) {
                console.error("Error fetching doctor", err);
                setError("Failed to load doctor profile.");
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
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const res = await getDoctorAvailability(id, dateStr);
                    const slotsData = res.data.data?.slots || res.data.slots || [];
                    // Handle both object format {startTime, endTime, isAvailable} and string format
                    const normalizedSlots = slotsData.map((slot: any, index: number) =>
                        typeof slot === 'string'
                            ? { startTime: slot, endTime: slot, isAvailable: true }
                            : { ...slot, _key: `${slot.startTime}-${index}` }
                    );
                    setSlots(normalizedSlots);
                } catch (e) {
                    console.error("Failed to fetch slots", e);
                    // Generate mock slots if API fails
                    const mockTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'];
                    setSlots(mockTimes.map((t) => ({ startTime: t, endTime: t, isAvailable: true })));
                }
            }
        };
        if (selectedDate) {
            fetchAvailability();
        }
    }, [id, selectedDate]);

    const today = startOfToday();
    const nextDays = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

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

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading doctor profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!doctor) return <div className="p-8 text-center text-gray-500">Doctor not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gov-blue-500 hover:text-gov-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Doctors
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gov-blue-100 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row gap-8">
                    <div className="w-32 h-32 bg-gov-blue-50 rounded-full flex-shrink-0 flex items-center justify-center text-gov-blue-600">
                        {doctor.profileImage ? (
                            <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <Stethoscope className="h-16 w-16" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gov-blue-700">{doctor.name}</h1>
                                <p className="text-xl text-gov-blue-600">{doctor.specialization}</p>
                                <p className="text-gray-500 mt-1">{doctor.qualification}</p>
                                {doctor.department && (
                                    <span className="inline-block mt-2 text-sm bg-gov-blue-50 text-gov-blue-600 px-3 py-1 rounded-full">
                                        {doctor.department.name}
                                    </span>
                                )}
                            </div>
                            <div className="bg-yellow-50 px-4 py-2 rounded-lg flex items-center gap-2 text-yellow-700 font-bold">
                                <Star className="h-5 w-5 fill-current" />
                                {doctor.rating?.toFixed(1) || '4.5'}
                                <span className="text-gray-400 font-normal text-sm">({doctor.totalReviews || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <span>{doctor.experience} Years Experience</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <span>Main Building</span>
                            </div>
                            {doctor.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <span>{doctor.phone}</span>
                                </div>
                            )}
                            {doctor.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span>{doctor.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {doctor.bio && (
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                        <h3 className="font-semibold text-gov-blue-700 mb-2">About Doctor</h3>
                        <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                    </div>
                )}
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gov-blue-100 p-8">
                <h2 className="text-2xl font-bold text-gov-blue-700 mb-6">Book Appointment</h2>

                {/* Date Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Select Date
                    </label>
                    <div className="flex overflow-x-auto gap-4 pb-2">
                        {nextDays.map((date) => {
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            const dayName = format(date, 'EEE');
                            const isAvailable = doctor.availability?.days?.some(
                                d => d.toLowerCase().startsWith(dayName.toLowerCase())
                            ) ?? true;

                            return (
                                <button
                                    key={date.toString()}
                                    disabled={!isAvailable}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setSelectedSlot(null);
                                    }}
                                    className={`flex-shrink-0 w-20 p-3 rounded-xl border text-center transition-all ${isSelected
                                        ? 'border-gov-blue-600 bg-gov-blue-50 text-gov-blue-600 ring-2 ring-gov-blue-100'
                                        : isAvailable
                                            ? 'border-gray-200 hover:border-gov-blue-300 hover:bg-gray-50'
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="text-xs uppercase font-medium">{format(date, 'EEE')}</div>
                                    <div className="text-lg font-bold mt-1">{format(date, 'd')}</div>
                                    <div className="text-xs text-gray-400">{format(date, 'MMM')}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slot Selection */}
                {selectedDate && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Available Time Slots
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {slots.length > 0 ? slots.filter(slot => slot.isAvailable).map((slot, index) => (
                                <button
                                    key={`${slot.startTime}-${index}`}
                                    onClick={() => setSelectedSlot(slot.startTime)}
                                    className={`py-3 px-3 text-sm rounded-lg border transition-all font-medium ${selectedSlot === slot.startTime
                                        ? 'bg-gov-blue-600 text-white border-gov-blue-600 shadow-sm'
                                        : 'border-gray-200 hover:border-gov-blue-400 hover:text-gov-blue-600 hover:bg-gov-blue-50'
                                        }`}
                                >
                                    {slot.startTime}
                                </button>
                            )) : (
                                <p className="col-span-full text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                                    No slots available for this date. Please select another date.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Consultation Fee</p>
                        <p className="text-3xl font-bold text-gov-blue-700">₹{doctor.consultationFee}</p>
                    </div>
                    <button
                        disabled={!selectedDate || !selectedSlot}
                        onClick={handleBook}
                        className={`px-8 py-4 rounded-xl font-bold text-white transition-all ${selectedDate && selectedSlot
                            ? 'bg-gov-blue-600 hover:bg-gov-blue-700 shadow-lg'
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
