'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
    const router = useRouter();
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate OTP sending
        setStep('OTP');
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3002/api/agriculture/farmers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('farmerId', data.data._id);
                router.push('/agriculture/dashboard');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            // Fallback for demo if backend not running
            if (otp === '123456') {
                router.push('/agriculture/dashboard');
            } else {
                alert('Login Failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Farmer Login</h3>
                <p className="text-sm text-gray-500">Access your dashboard via OTP.</p>
            </div>
            <div className="p-6">
                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phone"
                                placeholder="Enter mobile number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent"
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">
                            Send OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                id="otp"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-transparent"
                            />
                            <p className="text-xs text-gray-500">Use 123456 for demo</p>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            className="w-full text-green-600 hover:text-green-700 text-sm"
                            onClick={() => setStep('PHONE')}
                        >
                            Back
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
