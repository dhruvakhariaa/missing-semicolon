import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Appointment } from '../types';
import { getMyAppointments } from '../api';

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await getMyAppointments();
                setAppointments(res.data.data || res.data);
            } catch (err) {
                console.error("Failed to fetch appointments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading appointments...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>

            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">Upcoming</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Past</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancelled</button>
            </div>

            <div className="space-y-4">
                {appointments.length > 0 ? appointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900">{apt.doctorName}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </div>
                                <p className="text-gray-500">{apt.specialization} • {apt.department}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span>{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span>{apt.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{apt.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 md:pt-0">
                                {apt.status === 'scheduled' ? (
                                    <>
                                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 text-sm">
                                            Reschedule
                                        </button>
                                        <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 text-sm">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 text-sm">
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )) : <div className="text-gray-500">No appointments found.</div>}
            </div>
        </div>
    );
};

export default Appointments;
