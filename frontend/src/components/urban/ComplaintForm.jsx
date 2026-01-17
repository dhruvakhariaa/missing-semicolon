'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Water',
        description: '',
        location: '',
        citizenId: 'demo-citizen-123' // Hardcoded for demo
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('http://localhost:5003/api/urban/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Complaint submitted successfully!');
                setFormData({ ...formData, title: '', description: '', location: '' });
                router.refresh();
            } else {
                setMessage(data.error || 'Failed to submit complaint');
            }
        } catch (error) {
            setMessage('Network error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100/50 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 text-brand-800 flex items-center gap-2">
                <span className="p-2 bg-brand-50 rounded-lg text-brand-600">📝</span>
                File a Complaint
            </h2>

            {message && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-3 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <span>{message.includes('success') ? '✅' : '⚠️'}</span>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complaint Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                        placeholder="Briefly describe the issue..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 appearance-none outline-none cursor-pointer"
                            >
                                <option>Water</option>
                                <option>Electricity</option>
                                <option>Road</option>
                                <option>Waste Management</option>
                                <option>Sanitation</option>
                                <option>Other</option>
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                            placeholder="e.g., MG Road, Block 4"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none resize-none"
                        placeholder="Please provide specific details about the problem..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">↻</span> Submitting...
                        </>
                    ) : (
                        <>Submit Complaint <span className="text-xl">→</span></>
                    )}
                </button>
            </form>
        </div>
    );
}
