import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, User, Filter, Search } from 'lucide-react';
import type { LabReport } from '../types';

// Mock data for demo - will be replaced with API call
const mockLabReports: LabReport[] = [
    {
        _id: '1',
        patient: 'patient-id',
        testName: 'Complete Blood Count (CBC)',
        testDate: '2026-01-15',
        status: 'completed',
        resultUrl: '#',
        doctor: { _id: 'd1', name: 'Dr. Rajesh Kumar' }
    },
    {
        _id: '2',
        patient: 'patient-id',
        testName: 'Lipid Profile',
        testDate: '2026-01-10',
        status: 'completed',
        resultUrl: '#',
        doctor: { _id: 'd2', name: 'Dr. Priya Sharma' }
    },
    {
        _id: '3',
        patient: 'patient-id',
        testName: 'Liver Function Test (LFT)',
        testDate: '2026-01-17',
        status: 'processing',
        doctor: { _id: 'd1', name: 'Dr. Rajesh Kumar' }
    },
    {
        _id: '4',
        patient: 'patient-id',
        testName: 'Thyroid Profile (T3, T4, TSH)',
        testDate: '2026-01-17',
        status: 'pending',
        doctor: { _id: 'd3', name: 'Dr. Sunita Gupta' }
    },
];

const LabReports: React.FC = () => {
    const [reports, setReports] = useState<LabReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setReports(mockLabReports);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.testName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading lab reports...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">Lab Reports</h1>
                <p className="text-gov-blue-500">{reports.length} reports found</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gov-blue-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by test name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-blue-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                    <div key={report._id} className="bg-white p-6 rounded-xl shadow-sm border border-gov-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gov-blue-50 rounded-lg flex items-center justify-center text-gov-blue-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gov-blue-700">{report.testName}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(report.testDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {report.doctor.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                                {report.status === 'completed' && (
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-gov-blue-50 text-gov-blue-600 rounded-lg hover:bg-gov-blue-100 transition-colors">
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gov-blue-100">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-600">No lab reports found</p>
                        <p className="text-sm text-gray-400 mt-2">Your lab reports will appear here once they are ready.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabReports;
