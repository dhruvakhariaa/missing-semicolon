'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, AlertCircle, Heart, Edit2, Save, X } from 'lucide-react';
import type { Patient } from '@/types';
import { getPatientProfile } from '@/lib/api';

const PatientProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<Patient>({
        _id: '',
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '9876543210',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'O+',
        address: {
            street: '123 Main Street',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001'
        },
        emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '9876543211'
        },
        medicalHistory: {
            allergies: [],
            conditions: [],
            medications: []
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getPatientProfile();
                const data = res.data.data || res.data;
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // Keep default/mock profile on error (for demo purposes)
                setError("Could not load profile from server. Showing demo data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = () => {
        // TODO: Implement API call to save profile
        setIsEditing(false);
    };

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">My Health Profile</h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gov-blue-600 text-white rounded-lg font-medium hover:bg-gov-blue-700 transition-colors"
                    >
                        <Edit2 className="h-4 w-4" /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            <Save className="h-4 w-4" /> Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            <X className="h-4 w-4" /> Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gov-blue-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gov-blue-50">
                    <h2 className="text-lg font-bold text-gov-blue-700 flex items-center gap-2">
                        <User className="h-5 w-5" /> Personal Information
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium text-lg">{profile.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{profile.email}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.phone}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                        <p className="text-gray-900">
                            {new Date(profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                        <p className="text-gray-900">{profile.gender}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                            {profile.bloodGroup || 'Not Set'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gov-blue-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gov-blue-50">
                    <h2 className="text-lg font-bold text-gov-blue-700 flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Address
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-900">
                        {profile.address?.street || 'No address'}<br />
                        {profile.address?.city}, {profile.address?.state} - {profile.address?.pincode}
                    </p>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gov-blue-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-red-50">
                    <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> Emergency Contact
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                        <p className="text-gray-900 font-medium">{profile.emergencyContact?.name || 'Not Set'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Relationship</label>
                        <p className="text-gray-900">{profile.emergencyContact?.relationship || 'Not Set'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-gray-900">{profile.emergencyContact?.phone || 'Not Set'}</p>
                    </div>
                </div>
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-xl shadow-sm border border-gov-blue-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gov-blue-50">
                    <h2 className="text-lg font-bold text-gov-blue-700 flex items-center gap-2">
                        <Heart className="h-5 w-5" /> Medical History
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Allergies</label>
                        <div className="flex flex-wrap gap-2">
                            {(profile.medicalHistory?.allergies || []).length > 0 ? (
                                profile.medicalHistory?.allergies.map((allergy, i) => (
                                    <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                                        {allergy}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">None recorded</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Medical Conditions</label>
                        <div className="flex flex-wrap gap-2">
                            {(profile.medicalHistory?.conditions || []).length > 0 ? (
                                profile.medicalHistory?.conditions.map((condition, i) => (
                                    <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                        {condition}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">None recorded</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Current Medications</label>
                        <div className="flex flex-wrap gap-2">
                            {(profile.medicalHistory?.medications || []).length > 0 ? (
                                profile.medicalHistory?.medications.map((med, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        {med}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">None recorded</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
