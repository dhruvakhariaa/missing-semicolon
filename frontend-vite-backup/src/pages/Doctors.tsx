import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Clock, Search, Filter, Stethoscope, X } from 'lucide-react';
import type { Doctor, Department } from '../types';
import { getDoctors, getDepartments } from '../api';

const Doctors: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const deptFilter = searchParams.get('dept');
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedDept, setSelectedDept] = useState<string>(deptFilter || '');
    const [experienceFilter, setExperienceFilter] = useState<string>('');
    const [feeFilter, setFeeFilter] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, deptsRes] = await Promise.all([
                    getDoctors({}),
                    getDepartments()
                ]);
                setDoctors(doctorsRes.data.data || doctorsRes.data);
                setDepartments(deptsRes.data.data || deptsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("Failed to load doctors.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const applyFilters = () => {
        setShowFilters(false);
    };

    const clearFilters = () => {
        setSelectedDept('');
        setExperienceFilter('');
        setFeeFilter('');
        setRatingFilter('');
        setSearchParams({});
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = !selectedDept || doc.department?._id === selectedDept;

        const matchesExperience = !experienceFilter ||
            (experienceFilter === '0-5' && doc.experience <= 5) ||
            (experienceFilter === '5-10' && doc.experience > 5 && doc.experience <= 10) ||
            (experienceFilter === '10+' && doc.experience > 10);

        const matchesFee = !feeFilter ||
            (feeFilter === '0-500' && doc.consultationFee <= 500) ||
            (feeFilter === '500-1000' && doc.consultationFee > 500 && doc.consultationFee <= 1000) ||
            (feeFilter === '1000+' && doc.consultationFee > 1000);

        const matchesRating = !ratingFilter ||
            (ratingFilter === '4+' && (doc.rating || 0) >= 4) ||
            (ratingFilter === '4.5+' && (doc.rating || 0) >= 4.5);

        return matchesSearch && matchesDept && matchesExperience && matchesFee && matchesRating;
    });

    const activeFiltersCount = [selectedDept, experienceFilter, feeFilter, ratingFilter].filter(Boolean).length;

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading doctors...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">Find Doctors</h1>
                <p className="text-gov-blue-500">{filteredDoctors.length} specialists available</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gov-blue-100 sticky top-20 z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialization..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${activeFiltersCount > 0
                                ? 'border-gov-blue-500 bg-gov-blue-50 text-gov-blue-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-gov-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Department Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                                <select
                                    value={experienceFilter}
                                    onChange={(e) => setExperienceFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                                >
                                    <option value="">Any Experience</option>
                                    <option value="0-5">0-5 Years</option>
                                    <option value="5-10">5-10 Years</option>
                                    <option value="10+">10+ Years</option>
                                </select>
                            </div>

                            {/* Fee Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                                <select
                                    value={feeFilter}
                                    onChange={(e) => setFeeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                                >
                                    <option value="">Any Fee</option>
                                    <option value="0-500">Under ₹500</option>
                                    <option value="500-1000">₹500 - ₹1000</option>
                                    <option value="1000+">Above ₹1000</option>
                                </select>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                                >
                                    <option value="">Any Rating</option>
                                    <option value="4+">4+ Stars</option>
                                    <option value="4.5+">4.5+ Stars</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-6 py-2 bg-gov-blue-600 text-white rounded-lg hover:bg-gov-blue-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedDept && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gov-blue-50 text-gov-blue-700 rounded-full text-sm">
                            {departments.find(d => d._id === selectedDept)?.name}
                            <button onClick={() => setSelectedDept('')} className="hover:text-gov-blue-900"><X className="h-4 w-4" /></button>
                        </span>
                    )}
                    {experienceFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gov-blue-50 text-gov-blue-700 rounded-full text-sm">
                            {experienceFilter} Years
                            <button onClick={() => setExperienceFilter('')} className="hover:text-gov-blue-900"><X className="h-4 w-4" /></button>
                        </span>
                    )}
                    {feeFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gov-blue-50 text-gov-blue-700 rounded-full text-sm">
                            Fee: {feeFilter === '0-500' ? 'Under ₹500' : feeFilter === '500-1000' ? '₹500-₹1000' : 'Above ₹1000'}
                            <button onClick={() => setFeeFilter('')} className="hover:text-gov-blue-900"><X className="h-4 w-4" /></button>
                        </span>
                    )}
                    {ratingFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gov-blue-50 text-gov-blue-700 rounded-full text-sm">
                            {ratingFilter} Stars
                            <button onClick={() => setRatingFilter('')} className="hover:text-gov-blue-900"><X className="h-4 w-4" /></button>
                        </span>
                    )}
                </div>
            )}

            {/* Doctor List */}
            <div className="grid gap-6">
                {filteredDoctors.map((doc) => (
                    <div key={doc._id} className="bg-white p-6 rounded-xl shadow-sm border border-gov-blue-100 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gov-blue-50 rounded-full flex items-center justify-center text-gov-blue-600">
                                    {doc.profileImage ? (
                                        <img src={doc.profileImage} alt={doc.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Stethoscope className="h-10 w-10" />
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gov-blue-700">{doc.name}</h3>
                                        <p className="text-gov-blue-600 font-medium">{doc.specialization}</p>
                                        <p className="text-sm text-gray-500 mt-1">{doc.qualification}</p>
                                        {doc.department && (
                                            <p className="text-xs text-gov-blue-500 mt-1 bg-gov-blue-50 inline-block px-2 py-1 rounded">
                                                {doc.department.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-yellow-700 font-bold text-sm">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{doc.rating?.toFixed(1) || '4.0'}</span>
                                        <span className="text-gray-400 font-normal ml-1">({doc.totalReviews || 0})</span>
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
                                    <div className="flex items-center gap-1 font-semibold text-gov-blue-700">
                                        <span>₹{doc.consultationFee} Consultation Fee</span>
                                    </div>
                                </div>

                                {doc.bio && (
                                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{doc.bio}</p>
                                )}
                            </div>

                            {/* Action */}
                            <div className="flex flex-col justify-between items-end min-w-[150px]">
                                <div className="text-sm text-gray-500 text-right mb-4 md:mb-0">
                                    Available: <br />
                                    <span className="text-gov-blue-700 font-medium">
                                        {doc.availability?.days?.slice(0, 3).join(', ') || 'Mon-Fri'}
                                    </span>
                                </div>
                                <Link
                                    to={`/doctors/${doc._id}`}
                                    className="w-full sm:w-auto bg-gov-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gov-blue-700 transition-colors text-center"
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gov-blue-100">
                        <Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No doctors found matching your criteria.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
