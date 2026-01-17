import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Droplet, MapPin, Heart, AlertTriangle, Edit2 } from 'lucide-react';
import type { UserProfile } from '../types';
import { getPatientProfile } from '../api';

const PatientProfile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // In a real app, this would use the auth token
                const res = await getPatientProfile();
                setUser(res.data.data || res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // Fallback to mock data for demonstration
                setUser({
                    name: 'Neel Shah',
                    email: 'neel@example.com',
                    phone: '+91 98765 43210',
                    dob: '1998-01-15',
                    gender: 'Male',
                    bloodGroup: 'B+',
                    address: '123, Green Park, Ahmedabad, Gujarat',
                    emergencyContact: {
                        name: 'Parent Name',
                        relation: 'Father',
                        phone: '+91 98765 43211'
                    },
                    allergies: ['Penicillin', 'Dust'],
                    medicalConditions: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!user) return <div className="p-8 text-center">Profile not found</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                    <Edit2 className="h-4 w-4" /> {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid gap-6">
                {/* Personal Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Full Name</label>
                            <div className="font-medium text-gray-900">{user.name}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Gender</label>
                            <div className="font-medium text-gray-900">{user.gender}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</label>
                            <div className="font-medium text-gray-900">{user.email}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
                            <div className="font-medium text-gray-900">{user.phone}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> DOB</label>
                            <div className="font-medium text-gray-900">{user.dob}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500 flex items-center gap-1"><Droplet className="h-3 w-3" /> Blood Group</label>
                            <div className="font-bold text-red-600 bg-red-50 inline-block px-2 rounded">{user.bloodGroup}</div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</label>
                            <div className="font-medium text-gray-900">{user.address}</div>
                        </div>
                    </div>
                </div>

                {/* Medical Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <Heart className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Medical History</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Allergies</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.allergies?.map(allergy => (
                                    <span key={allergy} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium border border-orange-100 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {allergy}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Chronic Conditions</h3>
                            {user.medicalConditions && user.medicalConditions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.medicalConditions.map(condition => (
                                        <span key={condition} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                            {condition}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No known conditions</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <Phone className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Emergency Contact</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Name</label>
                            <div className="font-medium text-gray-900">{user.emergencyContact?.name}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Relation</label>
                            <div className="font-medium text-gray-900">{user.emergencyContact?.relation}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Phone</label>
                            <div className="font-medium text-gray-900">{user.emergencyContact?.phone}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
