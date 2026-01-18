'use client';

import { useState, useEffect } from 'react';
import { FileText, ClipboardList, Bell, MapPin, CheckCircle, Clock, AlertCircle, ArrowRight, Play, Check, XCircle, Megaphone, Building2, Phone, MessageSquare, Droplets, Zap, Construction, Trash2, Leaf, HelpCircle, ChevronRight } from 'lucide-react';
import DashboardFooter from '@/components/common/DashboardFooter';
import ComplaintForm from '@/components/urban/ComplaintForm';
import NotificationList from '@/components/urban/NotificationList';

interface Complaint {
    _id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    status: string;
    priority: string;
    images?: string[];
    history?: { status: string; timestamp: string; note: string }[];
    createdAt: string;
}

// Priority colors helper
const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'Low': return 'bg-brand-100 text-brand-500';
        case 'Medium': return 'bg-brand-100 text-brand-600';
        case 'High': return 'bg-brand-200 text-brand-700';
        case 'Urgent': return 'bg-brand-300 text-brand-900';
        default: return 'bg-brand-50 text-brand-600';
    }
};

// Tab configuration
const tabs = [
    { id: 'file-complaint', name: 'File a complaint', icon: FileText },
    { id: 'request-status', name: 'Track status', icon: ClipboardList },
    { id: 'notifications', name: 'Notifications', icon: Bell },
];

// Feature cards for the main view
const featureCards = [
    {
        id: 'file-complaint',
        icon: Megaphone,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-400',
        title: 'File Complaint',
        description: 'Report issues related to roads, water, electricity and more.',
        actionText: 'Report',
        actionColor: 'text-brand-400'
    },
    {
        id: 'request-status',
        icon: ClipboardList,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-500',
        title: 'Track Status',
        description: 'View and track your complaint requests.',
        actionText: 'Track',
        actionColor: 'text-brand-500'
    },
    {
        id: 'notifications',
        icon: Bell,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-400',
        title: 'Notifications',
        description: 'Stay updated with alerts and status changes.',
        actionText: 'View',
        actionColor: 'text-brand-400'
    },
    {
        id: 'departments',
        icon: Building2,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-500',
        title: 'Departments',
        description: 'Water, Roads, Electricity, Sanitation and more.',
        actionText: 'Explore',
        actionColor: 'text-brand-500'
    },
    {
        id: 'helpline',
        icon: Phone,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-600',
        title: 'Helpline',
        description: 'Call municipal helpline for urgent issues.',
        actionText: 'Call Now',
        actionColor: 'text-brand-600'
    },
    {
        id: 'feedback',
        icon: MessageSquare,
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-400',
        title: 'Feedback',
        description: 'Rate your experience with resolved complaints.',
        actionText: 'Submit',
        actionColor: 'text-brand-400'
    },
];

// Departments data
const departments = [
    { id: 'water', name: 'Water Supply', icon: Droplets, color: 'text-brand-400', bg: 'bg-brand-50', description: 'Water supply, pipelines, leakages', contact: '1800-111-001' },
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'text-brand-400', bg: 'bg-brand-50', description: 'Power supply, streetlights, wiring', contact: '1800-111-002' },
    { id: 'roads', name: 'Roads & Transport', icon: Construction, color: 'text-brand-500', bg: 'bg-brand-50', description: 'Road repairs, potholes, traffic', contact: '1800-111-003' },
    { id: 'waste', name: 'Waste Management', icon: Trash2, color: 'text-brand-500', bg: 'bg-brand-50', description: 'Garbage collection, recycling', contact: '1800-111-004' },
    { id: 'sanitation', name: 'Sanitation', icon: Leaf, color: 'text-brand-400', bg: 'bg-brand-50', description: 'Drainage, sewage, cleanliness', contact: '1800-111-005' },
    { id: 'other', name: 'Other Services', icon: HelpCircle, color: 'text-brand-500', bg: 'bg-brand-50', description: 'General inquiries and services', contact: '1800-111-000' },
];

// Helpline data
const helplines = [
    { name: 'Municipal Helpline', number: '1800-111-222', description: 'General municipal services', available: '24/7' },
    { name: 'Water Emergency', number: '1800-111-001', description: 'Water supply emergencies', available: '24/7' },
    { name: 'Power Outage', number: '1800-111-002', description: 'Electricity emergencies', available: '24/7' },
    { name: 'Road Accidents', number: '108', description: 'Emergency ambulance', available: '24/7' },
    { name: 'Police Control Room', number: '100', description: 'Law and order emergencies', available: '24/7' },
    { name: 'Fire Department', number: '101', description: 'Fire emergencies', available: '24/7' },
];

export default function UrbanPage() {
    const [activeTab, setActiveTab] = useState('file-complaint');
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    // Fetch complaints
    const fetchComplaints = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/urban/complaints', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setComplaints(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch complaints', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        if (activeTab === 'request-status' || activeFeature === 'request-status') {
            fetchComplaints();
        }
    }, [activeTab, activeFeature]);

    // Update complaint status
    const updateComplaintStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`http://localhost:3000/api/urban/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    ...(newStatus === 'Resolved' && { resolvedAt: new Date() })
                })
            });
            const data = await res.json();
            if (data.success) {
                // Use the full updated complaint from server (includes new history)
                setComplaints(prev =>
                    prev.map(c => c._id === id ? data.data : c)
                );
            }
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-brand-100 text-brand-500';
            case 'In Progress': return 'bg-brand-200 text-brand-600';
            case 'Pending': return 'bg-brand-100 text-brand-400';
            case 'Rejected': return 'bg-brand-200 text-brand-700';
            default: return 'bg-brand-50 text-brand-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Resolved': return <CheckCircle className="w-4 h-4" />;
            case 'In Progress': return <Clock className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusActions = (currentStatus: string) => {
        switch (currentStatus) {
            case 'Pending':
                return [
                    { status: 'In Progress', label: 'Start Progress', icon: Play, color: 'bg-brand-400 hover:bg-brand-500' },
                    { status: 'Rejected', label: 'Reject', icon: XCircle, color: 'bg-brand-600 hover:bg-brand-700' }
                ];
            case 'In Progress':
                return [
                    { status: 'Resolved', label: 'Mark Resolved', icon: Check, color: 'bg-brand-500 hover:bg-brand-600' },
                    { status: 'Pending', label: 'Back to Pending', icon: AlertCircle, color: 'bg-brand-300 hover:bg-brand-400' }
                ];
            case 'Resolved':
                return [];
            case 'Rejected':
                return [
                    { status: 'Pending', label: 'Reopen', icon: AlertCircle, color: 'bg-brand-300 hover:bg-brand-400' }
                ];
            default:
                return [];
        }
    };

    const handleCardClick = (cardId: string) => {
        setActiveFeature(cardId);
        if (['file-complaint', 'request-status', 'notifications'].includes(cardId)) {
            setActiveTab(cardId);
        }
    };

    const handleFeedbackSubmit = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/urban/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: feedbackRating,
                    message: feedbackText,
                    userId: 'demo-citizen-123',
                    category: 'General'
                })
            });
            const data = await res.json();
            if (data.success) {
                setFeedbackSubmitted(true);
                setTimeout(() => {
                    setFeedbackSubmitted(false);
                    setFeedbackRating(0);
                    setFeedbackText('');
                    setActiveFeature(null);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit feedback', error);
        }
    };

    // Render content based on active feature
    const renderContent = () => {
        const currentFeature = activeFeature || activeTab;

        switch (currentFeature) {
            case 'file-complaint':
                return (
                    <div className="max-w-2xl mx-auto">
                        <ComplaintForm />
                    </div>
                );

            case 'request-status':
                return (
                    <div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-5 rounded-xl border border-brand-100">
                                <div className="text-3xl font-dm-sans font-bold text-brand-900">{complaints.length}</div>
                                <div className="text-sm text-brand-500 font-inter">Total</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-brand-100">
                                <div className="text-3xl font-dm-sans font-bold text-brand-400">
                                    {complaints.filter(c => c.status === 'Pending').length}
                                </div>
                                <div className="text-sm text-brand-500 font-inter">Pending</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-brand-100">
                                <div className="text-3xl font-dm-sans font-bold text-brand-500">
                                    {complaints.filter(c => c.status === 'In Progress').length}
                                </div>
                                <div className="text-sm text-brand-500 font-inter">In Progress</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-brand-100">
                                <div className="text-3xl font-dm-sans font-bold text-brand-600">
                                    {complaints.filter(c => c.status === 'Resolved').length}
                                </div>
                                <div className="text-sm text-brand-500 font-inter">Resolved</div>
                            </div>
                        </div>

                        {/* Complaints List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-brand-100 animate-pulse">
                                        <div className="h-4 bg-brand-100 rounded w-3/4 mb-3"></div>
                                        <div className="h-3 bg-brand-50 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-brand-200">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-brand-200" />
                                <h3 className="text-lg font-dm-sans font-semibold text-brand-900 mb-2">No complaints yet</h3>
                                <p className="text-brand-500 font-inter mb-4">File your first complaint to track its status here.</p>
                                <button
                                    onClick={() => { setActiveFeature('file-complaint'); setActiveTab('file-complaint'); }}
                                    className="bg-brand-400 text-white px-4 py-2 rounded-lg hover:bg-brand-500 transition-colors font-inter font-medium"
                                >
                                    File a Complaint
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {complaints.map((complaint) => (
                                    <div
                                        key={complaint._id}
                                        className="bg-white p-6 rounded-xl border border-brand-100 hover:shadow-md transition-all"
                                    >
                                        {/* Header with title, priority badge, and status */}
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-dm-sans font-semibold text-brand-900 text-lg">{complaint.title}</h3>
                                                    {/* Priority Badge */}
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(complaint.priority)}`}>
                                                        {complaint.priority}
                                                    </span>
                                                </div>
                                                <p className="text-brand-600 font-inter mt-1">{complaint.description}</p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${getStatusColor(complaint.status)}`}>
                                                {getStatusIcon(complaint.status)}
                                                {complaint.status}
                                            </span>
                                        </div>

                                        {/* Images Gallery */}
                                        {complaint.images && complaint.images.length > 0 && (
                                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                {complaint.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img}
                                                        alt={`Complaint image ${idx + 1}`}
                                                        className="w-20 h-20 object-cover rounded-lg border border-brand-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(img, '_blank')}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-brand-50 text-sm text-brand-500 font-inter">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {complaint.location}
                                            </div>
                                            <span className="text-brand-200">|</span>
                                            <span>{complaint.category}</span>
                                            <span className="text-brand-200">|</span>
                                            <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>

                                        {/* Timeline/History */}
                                        {complaint.history && complaint.history.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-brand-50">
                                                <p className="text-sm font-dm-sans font-semibold text-brand-700 mb-3">Timeline</p>
                                                <div className="relative pl-4 border-l-2 border-brand-100 space-y-3">
                                                    {complaint.history.map((entry, idx) => (
                                                        <div key={idx} className="relative">
                                                            <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-white border-2 border-brand-300"></div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(entry.status)}`}>
                                                                    {entry.status}
                                                                </span>
                                                                <span className="text-xs text-brand-400 font-inter">
                                                                    {new Date(entry.timestamp).toLocaleDateString('en-IN')} {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-brand-500 font-inter mt-0.5">{entry.note}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {getStatusActions(complaint.status).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-brand-50">
                                                <span className="text-sm text-brand-500 mr-2 self-center font-inter">Change status:</span>
                                                {getStatusActions(complaint.status).map((action) => {
                                                    const Icon = action.icon;
                                                    return (
                                                        <button
                                                            key={action.status}
                                                            onClick={() => updateComplaintStatus(complaint._id, action.status)}
                                                            disabled={updatingId === complaint._id}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-inter font-medium transition-all disabled:opacity-50 ${action.color}`}
                                                        >
                                                            {updatingId === complaint._id ? (
                                                                <span className="animate-spin">...</span>
                                                            ) : (
                                                                <Icon className="w-4 h-4" />
                                                            )}
                                                            {action.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'notifications':
                return <NotificationList />;

            case 'departments':
                return (
                    <div>
                        <h2 className="text-xl font-dm-sans font-bold text-brand-900 mb-6">Municipal Departments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map((dept) => {
                                const Icon = dept.icon;
                                return (
                                    <div key={dept.id} className="bg-white p-6 rounded-xl border border-brand-100 hover:shadow-md transition-all">
                                        <div className={`w-12 h-12 ${dept.bg} rounded-xl flex items-center justify-center mb-4`}>
                                            <Icon className={`w-6 h-6 ${dept.color}`} />
                                        </div>
                                        <h3 className="font-dm-sans font-semibold text-brand-900 text-lg mb-2">{dept.name}</h3>
                                        <p className="text-brand-500 font-inter text-sm mb-4">{dept.description}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-brand-300" />
                                            <span className="font-inter font-medium text-brand-700">{dept.contact}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'helpline':
                return (
                    <div>
                        <h2 className="text-xl font-dm-sans font-bold text-brand-900 mb-2">Emergency Helplines</h2>
                        <p className="text-brand-500 font-inter mb-6">All helplines are toll-free and available 24/7</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {helplines.map((line, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-brand-100 hover:shadow-md transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-dm-sans font-semibold text-brand-900">{line.name}</h3>
                                        <p className="text-brand-500 font-inter text-sm">{line.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <a href={`tel:${line.number}`} className="text-2xl font-dm-sans font-bold text-brand-400 hover:text-brand-500">
                                            {line.number}
                                        </a>
                                        <p className="text-xs text-brand-500 font-inter font-medium">{line.available}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'feedback':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-dm-sans font-bold text-brand-900 mb-2">Submit Feedback</h2>
                        <p className="text-brand-500 font-inter mb-6">Help us improve our services by sharing your experience</p>

                        {feedbackSubmitted ? (
                            <div className="bg-brand-50 border border-brand-100 rounded-xl p-8 text-center">
                                <CheckCircle className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                                <h3 className="text-lg font-dm-sans font-semibold text-brand-700">Thank you for your feedback!</h3>
                                <p className="text-brand-500 font-inter">Your response has been recorded.</p>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl border border-brand-100">
                                {/* Rating */}
                                <div className="mb-6">
                                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-3">How was your experience?</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setFeedbackRating(star)}
                                                className={`text-3xl transition-transform hover:scale-110 ${feedbackRating >= star ? 'text-brand-400' : 'text-brand-100'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback text */}
                                <div className="mb-6">
                                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Your feedback</label>
                                    <textarea
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-all outline-none resize-none font-inter text-brand-900"
                                        placeholder="Share your experience or suggestions..."
                                    />
                                </div>

                                <button
                                    onClick={handleFeedbackSubmit}
                                    disabled={feedbackRating === 0}
                                    className="w-full bg-brand-400 text-white font-dm-sans font-bold py-3 rounded-xl hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-brand-50">
            {/* Hero Section - Aligned with tabs and cards */}
            <section className="max-w-7xl mx-auto px-6 pt-6">
                <div className="bg-gradient-to-r from-brand-700 via-brand-700 to-brand-600 rounded-xl sm:rounded-2xl">
                    <div className="relative px-8 sm:px-12 py-12 sm:py-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-brand-300 rounded-full"></span>
                            <span className="text-white/90 text-sm font-inter font-medium">Smart City Services</span>
                        </div>

                        {/* Headlines */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-dm-sans font-bold text-white mb-2">
                            Urban Development
                        </h1>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-dm-sans font-bold text-brand-200 mb-6">
                            For Every Citizen
                        </h2>

                        <p className="text-base sm:text-lg text-brand-100 font-inter max-w-xl mb-8">
                            Report issues, track complaints, and stay updated on urban
                            infrastructure improvements in your city.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => { setActiveFeature('file-complaint'); setActiveTab('file-complaint'); }}
                                className="bg-white text-brand-700 px-5 py-2.5 rounded-md font-dm-sans font-semibold hover:bg-brand-50 transition-all text-sm"
                            >
                                File Complaint
                            </button>
                            <button
                                onClick={() => { setActiveFeature('request-status'); setActiveTab('request-status'); }}
                                className="bg-brand-400 text-white px-5 py-2.5 rounded-md font-dm-sans font-semibold hover:bg-brand-500 transition-all text-sm"
                            >
                                Track Status
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="flex gap-8 border-b border-brand-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setActiveFeature(tab.id); }}
                                className={`flex items-center gap-2 py-4 px-1 font-inter font-medium text-sm border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-brand-400 text-brand-400'
                                    : 'border-transparent text-brand-500 hover:text-brand-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feature Cards Grid - 4 columns like Healthcare */}
            {!activeFeature && (
                <section className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-wrap lg:flex-nowrap gap-4">
                        {featureCards.slice(0, 4).map((card) => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className="bg-white p-5 rounded-lg border border-brand-100 text-left hover:shadow-lg hover:border-brand-200 transition-all duration-100 group flex flex-col h-[300px] w-[250px]"
                                >
                                    {/* Icon at top */}
                                    <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                    </div>

                                    {/* Content at bottom with large gap */}
                                    <div className="mt-auto pt-12">
                                        <h3 className="font-dm-sans font-bold text-brand-900 text-base mb-2">{card.title}</h3>
                                        <p className="text-brand-500 font-inter text-sm mb-4 leading-relaxed">{card.description}</p>
                                        <div className={`flex items-center gap-1 ${card.actionColor} font-inter font-medium text-sm group-hover:gap-2 transition-all`}>
                                            {card.actionText}
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {/* Second row for remaining cards */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-start mt-4">
                        {featureCards.slice(4).map((card) => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className="bg-white p-5 rounded-lg border border-brand-100 text-left hover:shadow-lg hover:border-brand-200 transition-all duration-100 group flex flex-col h-[300px] w-[250px]"
                                >
                                    {/* Icon at top */}
                                    <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                    </div>

                                    {/* Content at bottom with large gap */}
                                    <div className="mt-auto pt-12">
                                        <h3 className="font-dm-sans font-bold text-brand-900 text-base mb-2">{card.title}</h3>
                                        <p className="text-brand-500 font-inter text-sm mb-4 leading-relaxed">{card.description}</p>
                                        <div className={`flex items-center gap-1 ${card.actionColor} font-inter font-medium text-sm group-hover:gap-2 transition-all`}>
                                            {card.actionText}
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Active Feature Content */}
            {activeFeature && (
                <section className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => setActiveFeature(null)}
                        className="flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-6 text-sm font-inter font-medium"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back to all services
                    </button>
                    {renderContent()}
                </section>
            )}

            {/* Shared Footer */}
            <DashboardFooter />
        </div>
    );
}
