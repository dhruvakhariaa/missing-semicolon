'use client';

import { useEffect, useState } from 'react';

interface Complaint {
    _id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    status: string;
    createdAt: string;
}

export default function ComplaintList() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const res = await fetch('http://localhost:5003/api/urban/complaints', { cache: 'no-store' });
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

    if (loading) return <div className="text-center py-10 text-gray-500">Loading complaints...</div>;

    if (complaints.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No complaints found. File one to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
                <span>📋</span> Your Complaint History
            </h3>
            {complaints.map((complaint) => (
                <div key={complaint._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-cyan-200 hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {complaint.status}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                                {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <button className="text-gray-400 hover:text-brand-600 transition-colors">•••</button>
                    </div>

                    <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-cyan-600 transition-colors">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{complaint.description}</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <span>📍</span> {complaint.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <span>🏷️</span> {complaint.category}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
