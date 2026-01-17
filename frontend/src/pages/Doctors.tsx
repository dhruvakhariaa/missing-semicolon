import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Clock, Search, Filter } from 'lucide-react';
import type { Doctor } from '../types';
import { getDoctors } from '../api';

const Doctors: React.FC = () => {
    const [searchParams] = useSearchParams();
    const deptFilter = searchParams.get('dept');
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Build params
                const params: any = {};
                if (deptFilter) params.department = deptFilter;

                const response = await getDoctors(params);
                setDoctors(response.data.data || response.data);
            } catch (err) {
                console.error("Failed to fetch doctors", err);
                setError("Failed to load doctors.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [deptFilter]);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) return <div className="p-8 text-center">Loading doctors...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20 z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialization..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Doctor List */}
            <div className="grid gap-6">
                {filteredDoctors.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar Placeholder */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                                    {doc.image ? <img src={doc.image} alt={doc.name} className="w-full h-full rounded-full object-cover" /> : '👨‍⚕️'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{doc.name}</h3>
                                        <p className="text-blue-600 font-medium">{doc.specialization}</p>
                                        <p className="text-sm text-gray-500 mt-1">{doc.qualification}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold text-sm">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{doc.rating}</span>
                                        <span className="text-gray-400 font-normal ml-1">({doc.reviews})</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>Main Building</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{doc.experience} Years Exp.</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                                        <span>₹{doc.fee} Consultation Fee</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex flex-col justify-between items-end min-w-[150px]">
                                <div className="text-sm text-gray-500 text-right mb-4 md:mb-0">
                                    Available: <br />
                                    <span className="text-gray-900 font-medium">{doc.availableDays.join(', ')}</span>
                                </div>
                                <Link
                                    to={`/doctors/${doc.id}`}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No doctors found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
