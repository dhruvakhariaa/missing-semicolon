import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, User, Plus, X, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Appointment } from '../types';
import { getMyAppointments } from '../api';
import api from '../api';

const Appointments: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAppointments = async () => {
        try {
            const res = await getMyAppointments();
            setAppointments(res.data.data || res.data || []);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancelClick = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setShowCancelModal(true);
        setCancelReason('');
    };

    const handleRescheduleClick = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setShowRescheduleModal(true);
    };

    const confirmCancel = async () => {
        if (!selectedAppointment) return;

        setActionLoading(true);
        try {
            await api.delete(`/appointments/${selectedAppointment._id}`, {
                data: { reason: cancelReason || 'Cancelled by patient' }
            });
            // Refresh appointments
            await fetchAppointments();
            setShowCancelModal(false);
            setSelectedAppointment(null);
        } catch (err) {
            console.error("Failed to cancel appointment", err);
            alert('Failed to cancel appointment. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const confirmReschedule = async () => {
        if (!selectedAppointment) return;

        setActionLoading(true);
        try {
            // Cancel the old appointment first
            await api.delete(`/appointments/${selectedAppointment._id}`, {
                data: { reason: 'Rescheduled to a new time' }
            });
            // Navigate to doctor profile to book a new slot
            navigate(`/doctors/${selectedAppointment.doctor?._id || selectedAppointment.doctor}`);
        } catch (err) {
            console.error("Failed to cancel old appointment", err);
            // Still navigate even if cancel fails
            navigate(`/doctors/${selectedAppointment.doctor?._id || selectedAppointment.doctor}`);
        } finally {
            setActionLoading(false);
            setShowRescheduleModal(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConsultationIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'phone': return <Phone className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (activeTab === 'upcoming') return ['scheduled', 'confirmed'].includes(apt.status);
        if (activeTab === 'past') return apt.status === 'completed';
        if (activeTab === 'cancelled') return ['cancelled', 'no-show'].includes(apt.status);
        return true;
    });

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading appointments...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">My Appointments</h1>
                <Link
                    to="/doctors"
                    className="flex items-center gap-2 bg-gov-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gov-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" /> New Appointment
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'upcoming' ? 'text-gov-blue-600 border-b-2 border-gov-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'past' ? 'text-gov-blue-600 border-b-2 border-gov-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Past
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'cancelled' ? 'text-gov-blue-600 border-b-2 border-gov-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cancelled
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                    <div key={apt._id} className="bg-white rounded-xl shadow-sm border border-gov-blue-100 p-6 transition-shadow hover:shadow-md">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-lg font-bold text-gov-blue-700">
                                        {apt.doctor?.name || 'Doctor Name'}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {getConsultationIcon(apt.consultationType)}
                                        {apt.consultationType || 'In-Person'}
                                    </span>
                                </div>
                                <p className="text-gray-500">
                                    {apt.doctor?.specialization || 'Specialist'} • {apt.department?.name || 'Department'}
                                </p>
                                {apt.appointmentNumber && (
                                    <p className="text-xs text-gray-400 font-mono">Ref: {apt.appointmentNumber}</p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-gov-blue-500" />
                                        <span>
                                            {apt.appointmentDate
                                                ? new Date(apt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'Date TBD'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span>{apt.timeSlot?.startTime || apt.timeSlot?.start || 'Time TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>Main Building</span>
                                    </div>
                                </div>

                                {apt.symptoms && (
                                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mt-2">
                                        <strong>Symptoms:</strong> {apt.symptoms}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-2 md:pt-0">
                                {['scheduled', 'confirmed'].includes(apt.status) ? (
                                    <>
                                        <button
                                            onClick={() => handleRescheduleClick(apt)}
                                            className="px-4 py-2 border border-gov-blue-600 text-gov-blue-600 rounded-lg font-medium hover:bg-gov-blue-50 text-sm transition-colors"
                                        >
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleCancelClick(apt)}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 text-sm transition-colors"
                                        >
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
                )) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gov-blue-100">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-600">No {activeTab} appointments</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {activeTab === 'upcoming' && (
                                <Link to="/doctors" className="text-gov-blue-600 hover:underline">Book your first appointment →</Link>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle className="h-6 w-6" />
                            <h3 className="text-xl font-bold">Cancel Appointment</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel your appointment with <strong>{selectedAppointment.doctor?.name}</strong> on{' '}
                            <strong>{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</strong>?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation (optional)</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason..."
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none h-20"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={confirmCancel}
                                disabled={actionLoading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gov-blue-700">Reschedule Appointment</h3>
                            <button onClick={() => setShowRescheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            To reschedule your appointment with <strong>{selectedAppointment.doctor?.name}</strong>,
                            you'll be redirected to book a new time slot. Your current appointment will remain active until you book a new one.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500">Current Appointment</p>
                            <p className="font-medium text-gov-blue-700">
                                {new Date(selectedAppointment.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                {' at '}{selectedAppointment.timeSlot?.startTime || selectedAppointment.timeSlot?.start || 'TBD'}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReschedule}
                                className="px-6 py-2 bg-gov-blue-600 text-white rounded-lg font-medium hover:bg-gov-blue-700 transition-colors"
                            >
                                Choose New Time
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
