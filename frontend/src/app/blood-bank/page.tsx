'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, Phone, Search, AlertTriangle, Filter, Droplet, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { BloodInventory } from '@/types';

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

const HospitalInventoryCard = ({ hospital, items }: { hospital: string, items: BloodInventory[] }) => {
    const [isOpen, setIsOpen] = useState(true);

    const getStatusBadge = (units: number) => {
        if (units >= 30) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>;
        if (units >= 10) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Limited</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critical</span>;
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 transition-all duration-200">
            <div
                className="bg-gray-50 px-4 py-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <MapPin className="h-5 w-5 text-gov-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                            {hospital}
                            {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Live Inventory
                        </p>
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    Last Updated: <span className="font-mono ml-1 text-gray-900">{new Date(items[0].lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Table View */}
            {isOpen && (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units in Stock</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold text-xs ring-2 ring-white">
                                                    {item.bloodType}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">Type {item.bloodType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(item.units)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                            {item.units} Units
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert(`Request initiated for ${item.bloodType} blood at ${item.hospital}. Request ID: REQ-${Math.floor(Math.random() * 10000)}`);
                                                }}
                                                className="text-gov-blue-600 hover:text-gov-blue-900 inline-flex items-center gap-1 font-medium"
                                            >
                                                Request <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

const BloodBank = () => {
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
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">National Blood Bank Registry</h1>
                    <p className="text-gray-500 mt-1">Real-time blood availability across government hospitals</p>
                </div>
                <div className="flex gap-3">
                    <a href="tel:104" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors">
                        <Phone className="h-4 w-4 mr-2" />
                        Blood Helpline 104
                    </a>
                </div>
            </div>

            {/* Emergency Banner */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            <span className="font-bold">Urgent Notice:</span> Critical shortage of O- blood type in North Zone. Donors are requested to visit nearest district hospital.
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Hospital / Blood Bank..."
                            value={searchHospital}
                            onChange={(e) => setSearchHospital(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gov-blue-500 focus:border-gov-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="md:col-span-7 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500 mr-2 flex items-center">
                            <Filter className="h-4 w-4 mr-1" /> Filter Type:
                        </span>
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedType === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        {bloodTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedType === type
                                    ? 'bg-gov-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Listing */}
            <div className="space-y-6">
                {Object.entries(groupedByHospital).map(([hospital, items]) => (
                    <HospitalInventoryCard key={hospital} hospital={hospital} items={items} />
                ))}

                {Object.keys(groupedByHospital).length === 0 && (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                        <Droplet className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No matching records</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>

            {/* Footer Stats / CTA */}
            <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:p-10 sm:pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                Become a Blood Donor
                            </h2>
                            <p className="mt-4 text-lg text-gray-300">
                                Your contribution can save up to 3 lives. Register today and become a part of the national lifesaving network.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                            <div className="inline-flex rounded-md shadow">
                                <button
                                    onClick={() => alert("Redirecting to National Donor Registration Portal...")}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                                >
                                    Register as Donor
                                </button>
                            </div>
                            <div className="inline-flex rounded-md shadow">
                                <button
                                    onClick={() => alert("Searching for nearest blood donation camps based on your location...")}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    Find Donation Camp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodBank;
