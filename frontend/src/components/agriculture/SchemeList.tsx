'use client';

import { useState, useEffect } from 'react';

export function SchemeList() {
    const [schemes, setSchemes] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:3002/api/agriculture/schemes')
            .then(res => res.json())
            .then(data => data.success && setSchemes(data.data))
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Government Schemes</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {schemes.map((scheme, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="font-semibold text-green-700">{scheme.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scheme.description}</p>
                        <div className="mt-2 text-xs text-gray-500 flex gap-4">
                            <span>Target: {scheme.eligibility}</span>
                            <span className="font-medium text-green-600">{scheme.benefits}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
