'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agricultureApi } from '@/config/api';

export function FarmerRegistrationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        aadharNumber: '',
        village: '',
        taluka: '',
        district: '',
        state: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(agricultureApi.farmers, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                alert('Registration Successful!');
                localStorage.setItem('farmerId', data.data._id);
                router.push('/agriculture/dashboard');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Is backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">New Farmer Registration</h3>
                <p className="text-sm text-gray-500">Join the digital agriculture network.</p>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name" name="name" required
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            id="phone" name="phone" required
                            placeholder="10 digit mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="aadharNumber" className="text-sm font-medium text-gray-700">Aadhar Number</label>
                        <input
                            id="aadharNumber" name="aadharNumber" required
                            placeholder="12 digit UID"
                            value={formData.aadharNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="village" className="text-sm font-medium text-gray-700">Village</label>
                            <input id="village" name="village" required value={formData.village} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="taluka" className="text-sm font-medium text-gray-700">Taluka</label>
                            <input id="taluka" name="taluka" required value={formData.taluka} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="district" className="text-sm font-medium text-gray-700">District</label>
                            <input id="district" name="district" required value={formData.district} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="state" className="text-sm font-medium text-gray-700">State</label>
                            <input id="state" name="state" required value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
