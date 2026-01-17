'use client';

import { useState, useEffect } from 'react';

interface LandParcel {
    _id?: string;
    surveyNumber: string;
    area: number;
    village: string;
    irrigationType: string;
    currentCrop: string;
    sowingDate: string;
}

export function LandParcelList({ farmerId }: { farmerId: string }) {
    const [parcels, setParcels] = useState<LandParcel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newParcel, setNewParcel] = useState({
        surveyNumber: '',
        area: '',
        village: '',
        irrigationType: 'Rainfed',
        currentCrop: '',
        sowingDate: ''
    });

    const fetchParcels = async () => {
        try {
            const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}`);
            const data = await res.json();
            if (data.success) {
                setParcels(data.data.landParcels || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (farmerId) fetchParcels();
    }, [farmerId]);

    const handleAddParcel = async () => {
        try {
            const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}/land`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParcel)
            });
            const data = await res.json();
            if (data.success) {
                setParcels(data.data); // Returns updated list
                setIsAddOpen(false);
                // Reset form
                setNewParcel({
                    surveyNumber: '',
                    area: '',
                    village: '',
                    irrigationType: 'Rainfed',
                    currentCrop: '',
                    sowingDate: ''
                })
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading Land Parcels...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">My Land Parcels</h2>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                    + Add Parcel
                </button>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full text-gray-900">
                        <h3 className="text-lg font-semibold mb-4">Add New Land Parcel</h3>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Survey No.</label>
                                    <input className="w-full border rounded px-3 py-2 text-gray-900 bg-transparent" value={newParcel.surveyNumber} onChange={e => setNewParcel({ ...newParcel, surveyNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Area (Acres)</label>
                                    <input type="number" className="w-full border rounded px-3 py-2 text-gray-900 bg-transparent" value={newParcel.area} onChange={e => setNewParcel({ ...newParcel, area: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Village</label>
                                <input className="w-full border rounded px-3 py-2" value={newParcel.village} onChange={e => setNewParcel({ ...newParcel, village: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Crop</label>
                                <input className="w-full border rounded px-3 py-2" value={newParcel.currentCrop} onChange={e => setNewParcel({ ...newParcel, currentCrop: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700">Cancel</button>
                                <button onClick={handleAddParcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Parcel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {parcels.length === 0 ? (
                    <p className="text-gray-500 p-4 border rounded-lg bg-gray-50 text-center">No land parcels added yet.</p>
                ) : (
                    parcels.map((parcel, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <div className="pb-2 mb-2 border-b border-gray-100">
                                <h3 className="font-semibold text-lg text-gray-900">{parcel.village} - Survey {parcel.surveyNumber}</h3>
                                <p className="text-sm text-gray-500">{parcel.area} Acres • {parcel.irrigationType}</p>
                            </div>
                            <div className="text-sm space-y-1 text-gray-700">
                                <p><span className="font-medium">Current Crop:</span> {parcel.currentCrop || 'None'}</p>
                                {parcel.sowingDate && <p><span className="font-medium">Sown:</span> {new Date(parcel.sowingDate).toLocaleDateString()}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
