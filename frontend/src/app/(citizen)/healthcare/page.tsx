'use client';

import Link from 'next/link';
import { Building2, Stethoscope, Calendar, User, ArrowRight, Video, FileText } from 'lucide-react';
import DashboardFooter from '@/components/common/DashboardFooter';

export default function HealthcarePage() {
    return (
        <div className="min-h-screen bg-brand-50">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-6">
                <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-xl sm:rounded-2xl shadow-xl relative overflow-hidden">
                    {/* Abstract Decorative Background */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-bottom-right"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative px-8 sm:px-12 py-12 sm:py-16">
                        <div className="relative z-10 space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/20 text-white">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                National Digital Health Mission
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                                Advanced Healthcare
                            </h1>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-brand-200 mb-6">
                                For Every Citizen
                            </h2>
                            <p className="text-base sm:text-lg text-brand-100 font-body max-w-xl mb-8">
                                Access medical services, tele-consultations, and digital health records seamlessly on India&apos;s unified platform.
                            </p>
                            <div className="flex gap-4 pt-2">
                                <Link href="/healthcare/appointments" className="bg-white text-brand-700 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-lg shadow-black/10">
                                    Book Appointment
                                </Link>
                                <Link href="/healthcare/doctors" className="bg-brand-600 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-500 transition-colors">
                                    Find Doctors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions Navigation */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="flex flex-wrap items-center justify-start gap-8 border-b-2 border-brand-100 pb-2">
                    <Link href="/healthcare" className="flex items-center gap-2 text-xl font-bold text-brand-700 border-b-4 border-brand-600 -mb-[10px] pb-2 hover:text-brand-800 transition-colors">
                        <Building2 className="h-5 w-5" /> All services
                    </Link>
                </div>

                {/* Feature Cards Grid (4x2 Layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* 1. Departments */}
                    <Link href="/healthcare/departments" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden">
                            <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-blue-600 transition-colors">Departments</h3>
                                <p className="text-sm text-gray-500 mt-2">Cardiology, Neurology, General Medicine & more.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-blue-600 gap-1 border-t border-gray-100 pt-4">
                                    Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 2. Find Doctors */}
                    <Link href="/healthcare/doctors" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden">
                            <div className="h-14 w-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                <Stethoscope className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-indigo-600 transition-colors">Find Doctors</h3>
                                <p className="text-sm text-gray-500 mt-2">Search best specialists near you.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-indigo-600 gap-1 border-t border-gray-100 pt-4">
                                    Search <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 3. My Schedule */}
                    <Link href="/healthcare/appointments" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden">
                            <div className="h-14 w-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-green-600 transition-colors">My Schedule</h3>
                                <p className="text-sm text-gray-500 mt-2">View upcoming & past appointments.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-green-600 gap-1 border-t border-gray-100 pt-4">
                                    View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 4. Health ID */}
                    <Link href="/healthcare/profile" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden">
                            <div className="h-14 w-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                                <User className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-orange-600 transition-colors">ABHA Health ID</h3>
                                <p className="text-sm text-gray-500 mt-2">Digital health records & profile.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-orange-600 gap-1 border-t border-gray-100 pt-4">
                                    Manage <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 5. Tele-Medicine */}
                    <Link href="/healthcare/doctors?consult=video" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden">
                            <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                <Video className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-purple-600 transition-colors">Tele-Medicine</h3>
                                <p className="text-sm text-gray-500 mt-2">Connect with doctors remotely.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-purple-600 gap-1 border-t border-gray-100 pt-4">
                                    Connect <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 6. Lab Reports */}
                    <Link href="/healthcare/lab-reports" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all relative overflow-hidden">
                            <div className="h-14 w-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-teal-600 transition-colors">Lab Reports</h3>
                                <p className="text-sm text-gray-500 mt-2">Access pathology & diagnostic reports.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-teal-600 gap-1 border-t border-gray-100 pt-4">
                                    Access <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 7. Blood Bank */}
                    <Link href="/healthcare/blood-bank" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all relative overflow-hidden">
                            <div className="h-14 w-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.6 4.7a6 6 0 0 1 0 8.5l-6 6a1 1 0 0 1-1.4 0l-6-6a6 6 0 0 1 8.5-8.5l.7.7.7-.7Z" /><path d="M12 11v6" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-red-600 transition-colors">Blood Bank</h3>
                                <p className="text-sm text-gray-500 mt-2">Check blood availability nearby.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-red-600 gap-1 border-t border-gray-100 pt-4">
                                    Check <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 8. Ambulance */}
                    <Link href="/healthcare/emergency" className="group">
                        <div className="aspect-[4/5] bg-white rounded-2xl border border-brand-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 transition-all relative overflow-hidden">
                            <div className="h-14 w-14 bg-red-100 rounded-xl flex items-center justify-center text-red-700 mb-4 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-700 group-hover:text-red-700 transition-colors">108 Emergency</h3>
                                <p className="text-sm text-gray-500 mt-2">Instant ambulance service.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-red-700 gap-1 border-t border-gray-100 pt-4">
                                    Call Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* Shared Footer */}
            <DashboardFooter />
        </div>
    );
}
