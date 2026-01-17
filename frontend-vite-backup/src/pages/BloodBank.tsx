import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, Phone, Search, AlertCircle } from 'lucide-react';
import type { BloodInventory } from '../types';

// Mock data for demo
const mockBloodInventory: BloodInventory[] = [
    { _id: '1', bloodType: 'A+', units: 45, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '2', bloodType: 'A-', units: 12, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '3', bloodType: 'B+', units: 38, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '4', bloodType: 'B-', units: 8, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '5', bloodType: 'AB+', units: 22, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '6', bloodType: 'AB-', units: 5, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '7', bloodType: 'O+', units: 65, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '8', bloodType: 'O-', units: 15, hospital: 'AIIMS Delhi', lastUpdated: '2026-01-17T10:00:00Z' },
    { _id: '9', bloodType: 'A+', units: 32, hospital: 'Safdarjung Hospital', lastUpdated: '2026-01-17T09:30:00Z' },
    { _id: '10', bloodType: 'B+', units: 28, hospital: 'Safdarjung Hospital', lastUpdated: '2026-01-17T09:30:00Z' },
    { _id: '11', bloodType: 'O+', units: 42, hospital: 'Safdarjung Hospital', lastUpdated: '2026-01-17T09:30:00Z' },
    { _id: '12', bloodType: 'AB+', units: 18, hospital: 'Safdarjung Hospital', lastUpdated: '2026-01-17T09:30:00Z' },
];

const BloodBank: React.FC = () => {
    const [inventory, setInventory] = useState<BloodInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [searchHospital, setSearchHospital] = useState('');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setInventory(mockBloodInventory);
            setLoading(false);
        }, 500);
    }, []);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const getAvailabilityColor = (units: number) => {
        if (units >= 30) return 'text-green-600 bg-green-50 border-green-200';
        if (units >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getAvailabilityLabel = (units: number) => {
        if (units >= 30) return 'Available';
        if (units >= 10) return 'Limited';
        return 'Critical';
    };

    const filteredInventory = inventory.filter(item => {
        const matchesType = selectedType === 'all' || item.bloodType === selectedType;
        const matchesHospital = item.hospital.toLowerCase().includes(searchHospital.toLowerCase());
        return matchesType && matchesHospital;
    });

    // Group by hospital
    const groupedByHospital = filteredInventory.reduce((acc, item) => {
        if (!acc[item.hospital]) acc[item.hospital] = [];
        acc[item.hospital].push(item);
        return acc;
    }, {} as Record<string, BloodInventory[]>);

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading blood bank data...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">Blood Bank</h1>
                <a href="tel:104" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    <Phone className="h-4 w-4" /> Call 104 Helpline
                </a>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-red-700">Emergency Blood Requirement?</p>
                    <p className="text-sm text-red-600">Call 104 Blood Helpline for urgent blood requirements. Available 24x7.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gov-blue-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by hospital name..."
                            value={searchHospital}
                            onChange={(e) => setSearchHospital(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedType === 'all' ? 'bg-gov-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All Types
                        </button>
                        {bloodTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedType === type ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory by Hospital */}
            <div className="space-y-6">
                {Object.entries(groupedByHospital).map(([hospital, items]) => (
                    <div key={hospital} className="bg-white rounded-xl shadow-sm border border-gov-blue-100 overflow-hidden">
                        <div className="p-4 bg-gov-blue-50 border-b border-gov-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gov-blue-600" />
                                <h2 className="font-bold text-gov-blue-700">{hospital}</h2>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                Updated: {new Date(items[0].lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {items.map(item => (
                                <div
                                    key={item._id}
                                    className={`p-4 rounded-xl border-2 text-center ${getAvailabilityColor(item.units)}`}
                                >
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <Heart className="h-5 w-5" />
                                        <span className="text-2xl font-bold">{item.bloodType}</span>
                                    </div>
                                    <p className="text-3xl font-bold">{item.units}</p>
                                    <p className="text-sm">units</p>
                                    <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-white">
                                        {getAvailabilityLabel(item.units)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedByHospital).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gov-blue-100">
                        <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-600">No blood availability data found</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>

            {/* Donate Blood CTA */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Donate Blood, Save Lives</h3>
                <p className="text-red-100 mb-4">One donation can save up to 3 lives. Find a blood donation camp near you.</p>
                <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors">
                    Find Donation Camp
                </button>
            </div>
        </div>
    );
};

export default BloodBank;
