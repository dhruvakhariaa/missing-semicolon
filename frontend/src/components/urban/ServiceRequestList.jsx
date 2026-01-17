'use client';

import { useEffect, useState } from 'react';

export default function ServiceRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        // OFFLINE MODE: Using mock data directly since no database is available
        setRequests([
            { _id: 'REQ001', serviceType: 'New Water Connection', status: 'Pending', createdAt: new Date().toISOString() },
            { _id: 'REQ002', serviceType: 'Birth Certificate', status: 'Completed', createdAt: new Date().toISOString() },
            { _id: 'REQ003', serviceType: 'Property Tax Assessment', status: 'Approved', createdAt: new Date().toISOString() }
        ]);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (loading) return <div className="text-center py-10 text-brand-500 font-medium animate-pulse">Loading requests...</div>;

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-3">📂</div>
                <h3 className="text-lg font-semibold text-gray-900">No Active Requests</h3>
                <p className="text-gray-500">You haven't requested any services yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📑</span> Your Service Requests
            </h3>
            {requests.map((req) => (
                <div key={req._id} className="bg-white p-5 rounded-xl shadow-sm border border-brand-50 hover:border-brand-200 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {req.status}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                                {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-brand-600">#{req._id.slice(-6).toUpperCase()}</span>
                    </div>

                    <h4 className="font-bold text-gray-800 text-lg mb-1">{req.serviceType}</h4>
                    {/* Add more details if available in model */}
                </div>
            ))}
        </div>
    );
}
