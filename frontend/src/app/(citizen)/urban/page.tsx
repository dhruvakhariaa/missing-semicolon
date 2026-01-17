'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import ComplaintForm from '@/components/urban/ComplaintForm';
import ComplaintList from '@/components/urban/ComplaintList';
import ServiceRequestList from '@/components/urban/ServiceRequestList';
import NotificationList from '@/components/urban/NotificationList';

// --- Stat Card Component ---
function StatCard({ label, mainValue, subData, actionButton }: {
    label: string,
    mainValue: string | number,
    subData: { label: string, value: string | number, color?: string }[],
    actionButton?: React.ReactNode
}) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="text-gray-900 font-bold text-lg mb-1">{label}</h3>
            <div className="text-4xl font-extrabold text-green-700 mb-6">{mainValue}</div>

            <div className="space-y-3 mb-6">
                {subData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">{item.label}</span>
                        <span className={item.color || "text-gray-900"}>{item.value}</span>
                    </div>
                ))}
            </div>

            {actionButton && (
                <div className="mt-2">
                    {actionButton}
                </div>
            )}
        </div>
    );
}

export default function UrbanPage() {
    const [activeTab, setActiveTab] = useState('complaints');
    const [stats, setStats] = useState({
        complaints: { total: 3, resolved: 1, pending: 2 },
        requests: { total: 3, active: 1, completed: 1 },
        notifications: { unread: 3 }
    });

    // Mock Fetch Stats
    useEffect(() => {
        // purely frontend mock for now to match visual design immediately
        // In real app, we would fetch from APIs like /api/urban/stats
    }, []);

    const user = { name: "Varun Patel" };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 text-center">
                    {/* Placeholder Image */}
                    <div className="mb-8 relative inline-block w-full max-w-2xl">
                        <div className="h-48 w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer">
                            <span className="text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
                                {'{ Urban Infrastructure Hero Image }'}
                            </span>
                            <span className="text-xs text-gray-400 mt-2">Smart City Dashboard Banner</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Welcome Back, {user.name}
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Access your complaints, service requests, and notifications all in one place.
                    </p>
                </div>
            </section>

            {/* Dashboard Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('complaints')}
                            className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'complaints'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Complaints
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'requests'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Service Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'notifications'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Notifications
                            {stats.notifications.unread > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {stats.notifications.unread}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* COMPLAINTS TAB */}
                {activeTab === 'complaints' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        {/* Left Column: Stats & Actions */}
                        <div className="lg:col-span-4 space-y-6">
                            <StatCard
                                label="Total Complaints"
                                mainValue={stats.complaints.total}
                                subData={[
                                    { label: "Resolved", value: stats.complaints.resolved, color: "text-green-600 font-bold" },
                                    { label: "Pending", value: stats.complaints.pending, color: "text-orange-500 font-bold" }
                                ]}
                                actionButton={
                                    <button className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                                        <Plus size={18} />
                                        File New Complaint
                                    </button>
                                }
                            />

                            {/* Embedded Complaint Form (Optional or via Modal, putting inline for now as requested by user context often) */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm">Quick Actions</h4>
                                <p className="text-xs text-gray-500 mb-3">Submit a complaint about potholes, garbage, or streetlights nearby.</p>
                                <ComplaintForm />
                            </div>
                        </div>

                        {/* Right Column: Active Items List */}
                        <div className="lg:col-span-8">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Active Complaints</h2>
                            </div>
                            <ComplaintList />
                        </div>
                    </div>
                )}

                {/* SERVICE REQUESTS TAB */}
                {activeTab === 'requests' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        <div className="lg:col-span-4">
                            <StatCard
                                label="Active Requests"
                                mainValue={stats.requests.active}
                                subData={[
                                    { label: "Total Requests", value: stats.requests.total },
                                    { label: "Completed", value: stats.requests.completed, color: "text-blue-600 font-bold" }
                                ]}
                                actionButton={
                                    <button className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                                        <Plus size={18} />
                                        New Service Request
                                    </button>
                                }
                            />
                        </div>
                        <div className="lg:col-span-8">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
                            </div>
                            <ServiceRequestList />
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="max-w-3xl animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
                        <p className="text-gray-500 mb-8">Stay updated with the latest alerts and status changes.</p>
                        <NotificationList />
                    </div>
                )}

            </main>
        </div>
    );
}
