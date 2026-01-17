'use client';

import { useEffect, useState } from 'react';

interface ServiceRequest {
    _id: string;
    serviceType: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    createdAt: string;
}

export default function ServiceRequestList() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch('http://localhost:5003/api/urban/service-requests', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch service requests', error);
        } finally {
            setLoading(false);
        }
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
