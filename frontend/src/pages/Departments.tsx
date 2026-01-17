import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, ArrowRight, Brain, Baby, Bone } from 'lucide-react';
import type { Department } from '../types';
import { getDepartments } from '../api';

const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await getDepartments();
                // Assuming response.data is the array or response.data.data
                // Adjust based on actual API response structure. 
                // Usually axios returns data in response.data
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

    const getIcon = (name: string) => {
        if (name.includes('Cardiology')) return <Heart className="h-6 w-6" />;
        if (name.includes('Orthopedics')) return <Bone className="h-6 w-6" />;
        if (name.includes('Pediatrics')) return <Baby className="h-6 w-6" />;
        if (name.includes('Neurology')) return <Brain className="h-6 w-6" />;
        return <Activity className="h-6 w-6" />;
    };

    if (loading) return <div className="p-8 text-center">Loading departments...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
                <p className="text-gray-500">Find the right care for your needs</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <div
                        key={dept.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                {getIcon(dept.name)}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
                        <p className="text-gray-500 mb-4 flex-grow">{dept.description}</p>

                        <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                            <p>📍 {dept.location.building} | Floor: {dept.location.floor}</p>
                        </div>

                        <Link
                            to={`/doctors?dept=${dept.id}`}
                            className="mt-4 flex items-center justify-center text-blue-600 font-medium hover:text-blue-700 transition-colors py-2 bg-blue-50 rounded-lg hover:bg-blue-100"
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
