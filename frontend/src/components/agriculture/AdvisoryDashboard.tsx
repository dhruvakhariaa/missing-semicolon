'use client';

import { useState, useEffect } from 'react';
import { agricultureApi } from '@/config/api';

interface Advisory {
    crop: string;
    stage: string;
    advice_en?: string;
    advice_hi?: string;
    advice?: string; // Legacy support
    type: string;
}

export function AdvisoryDashboard({ crops = [], farmerId }: { crops?: any[], farmerId?: string }) {
    const [advisories, setAdvisories] = useState<Advisory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en'); // Default 'en'

    // Set initial language based on preference or default
    useEffect(() => {
        setLanguage('en');
    }, []);

    // Extract unique crops for display/keys (from parcel objects)
    const uniqueCrops = Array.from(new Set(crops.map(p => p.currentCrop || p.crop).filter(Boolean)));

    useEffect(() => {
        const fetchAdvisories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Construct rich context
                const contextList = crops
                    .filter(p => p.currentCrop || p.crop)
                    .map(p => `${p.currentCrop || p.crop} (Stage: ${p.stage || 'Unknown'}, Age: ${p.daysSown || 0} days)`);

                const query = contextList.length > 0 ? `?crop=${encodeURIComponent(contextList.join(', '))}` : '';
                const farmerQuery = farmerId ? `&farmerId=${farmerId}` : '';
                const url = `http://localhost:3002/api/agriculture/advisories${query}${farmerQuery}`;

                const res = await fetch(url);
                const data = await res.json();

                if (data.success) {
                    if (data.data.length === 0) {
                        console.warn("Backend returned empty data");
                    }
                    setAdvisories(data.data);

                    if (data.trace) {
                        setError(`Trace: ${data.trace.join(' -> ')}`);
                    }
                } else {
                    setError(data.message || 'Failed to load advice');
                }
            } catch (err: any) {
                setError(err.message || "Network Error");
            } finally {
                setIsLoading(false);
            }
        };

        if (crops.length > 0) {
            fetchAdvisories();
        }
    }, [crops, farmerId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 p-2 rounded-lg">🌱</span>
                    {language === 'en' ? 'AI-Personalized Crop Advisories' : 'एआई-व्यक्तिगत फसल सलाह'}
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all text-sm font-bold text-blue-700"
                    >
                        <span className="text-xs uppercase tracking-wider text-gray-400 mr-1">{language === 'en' ? 'Translate' : 'अनुवाद'}</span>
                        {language === 'en' ? '🇮🇳 हिंदी में पढ़ें' : '🇺🇸 Read in English'}
                    </button>
                    {isLoading && <span className="text-sm text-blue-600 animate-pulse font-medium">Generating...</span>}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-4">
                    ⚠️ {error} <br />
                    <span className="text-xs font-normal opacity-75">Check if backend is running (localhost:3002)</span>
                </div>
            )}

            {uniqueCrops.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {uniqueCrops.map((c: any, i) => (
                        <span key={i} className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-full uppercase tracking-wide">
                            {c}
                        </span>
                    ))}
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
                {isLoading ? (
                    [1, 2].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))
                ) : advisories.length > 0 ? (
                    advisories.map((advisory, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-5 group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${advisory.type === 'Disease' ? 'bg-blue-600' :
                                advisory.type === 'Pest' ? 'bg-blue-500' :
                                    advisory.type === 'Water' ? 'bg-sky-500' : 'bg-sky-400'
                                }`}></div>

                            <div className="flex justify-between items-start mb-3 pl-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{advisory.crop}</h3>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{advisory.stage}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase shadow-sm ${advisory.type === 'Disease' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    advisory.type === 'Pest' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        advisory.type === 'Water' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                            'bg-sky-50 text-sky-700 border border-sky-100'
                                    }`}>
                                    {advisory.type}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-3 text-sm">
                                {language === 'hi'
                                    ? (advisory.advice_hi || advisory.advice || "अनुवाद उपलब्ध नहीं है")
                                    : (advisory.advice_en || advisory.advice)}
                            </p>
                        </div>
                    ))
                ) : (
                    !error && (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No specific advice found. Add crops to get started.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
