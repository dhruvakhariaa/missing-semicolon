'use client';

import { useState, useEffect } from 'react';

interface Advisory {
    crop: string;
    stage: string;
    advice: string;
    type: string;
}

export function AdvisoryDashboard({ crops = [] }: { crops?: string[] }) {
    const [advisories, setAdvisories] = useState<Advisory[]>([]);

    useEffect(() => {
        fetch('http://localhost:3002/api/agriculture/advisories')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAdvisories(data.data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Filter advisories based on farmer's crops
    const filteredAdvisories = advisories.filter(advisory => {
        if (!crops || crops.length === 0) return true; // Show all if no crops defined
        // Check if advisory crop matches any of the user's crops
        // If the advisory is for 'All' or 'General' crops, we might still want to show it, 
        // but if it is a specific crop like 'Rice', it should match the user's crops.
        const isGeneralCrop = advisory.crop.toLowerCase() === 'general' || advisory.crop.toLowerCase() === 'all';
        return isGeneralCrop || crops.some(c => c.toLowerCase().includes(advisory.crop.toLowerCase()) || advisory.crop.toLowerCase().includes(c.toLowerCase()));
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
                {crops.length > 0 ? 'Personalized Crop Advisories' : 'Live Crop Advisories'}
            </h2>
            {crops.length > 0 && (
                <div className="flex gap-2">
                    {crops.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {c}
                        </span>
                    ))}
                </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredAdvisories.length > 0 ? (
                    filteredAdvisories.map((advisory, idx) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-yellow-900">{advisory.crop}</h3>
                                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                    {advisory.type}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-yellow-800 mb-1">Stage: {advisory.stage}</p>
                            <p className="text-sm text-yellow-700">{advisory.advice}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No specific advice found for your crops.</p>
                )}
            </div>
        </div>
    );
}
