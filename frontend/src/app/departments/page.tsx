'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Activity, ArrowRight, Brain, Baby, Bone, Stethoscope, Ear, User } from 'lucide-react';
import type { Department } from '@/types';
import { getDepartments } from '@/lib/api';

const Departments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await getDepartments();
                setDepartments(response.data.data || response.data);
            } catch (err) {
                console.error("Failed to fetch departments", err);
                setError("Failed to load departments.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            'heart': <Heart className="h-6 w-6" />,
            'bone': <Bone className="h-6 w-6" />,
            'baby': <Baby className="h-6 w-6" />,
            'brain': <Brain className="h-6 w-6" />,
            'stethoscope': <Stethoscope className="h-6 w-6" />,
            'ear': <Ear className="h-6 w-6" />,
            'user': <User className="h-6 w-6" />,
        };
        return icons[iconName] || <Activity className="h-6 w-6" />;
    };

    if (loading) return <div className="p-8 text-center text-gov-blue-600">Loading departments...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gov-blue-700">Departments</h1>
                <p className="text-gov-blue-500">Find the right care for your needs</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <div
                        key={dept._id}
                        className="bg-white rounded-xl shadow-sm border border-gov-blue-100 p-6 flex flex-col hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gov-blue-50 rounded-lg text-gov-blue-600">
                                {getIcon(dept.icon)}
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                {dept.isActive ? 'Open' : 'Closed'}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-gov-blue-700 mb-2">{dept.name}</h3>
                        <p className="text-gray-500 mb-4 flex-grow text-sm">{dept.description}</p>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <p>📍 {dept.location?.building || 'Main Building'} | Floor: {dept.location?.floor || 'Ground'}</p>
                            {dept.contactPhone && <p className="mt-1">📞 {dept.contactPhone}</p>}
                        </div>

                        <Link
                            href={`/doctors?dept=${dept._id}`}
                            className="mt-4 flex items-center justify-center text-white font-medium bg-gov-blue-600 hover:bg-gov-blue-700 transition-colors py-3 rounded-lg"
                        >
                            View Doctors <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Departments;
