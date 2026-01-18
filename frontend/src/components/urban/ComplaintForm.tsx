'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, MapPin, Loader2 } from 'lucide-react';

export default function ComplaintForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Water',
        description: '',
        location: '',
        priority: 'Medium',
        citizenId: 'demo-citizen-123'
    });
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'location') {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (value.length > 2) {
                debounceRef.current = setTimeout(async () => {
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
                        const data = await res.json();
                        setSuggestions(data);
                        setShowSuggestions(true);
                    } catch (err) {
                        console.error("Autocomplete error:", err);
                    }
                }, 500);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
    };

    const handleSelectLocation = (place: any) => {
        setFormData(prev => ({
            ...prev,
            location: place.display_name
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Handle image upload - convert to base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (images.length >= 3) return; // Max 3 images

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImages(prev => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Geolocation Handler
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setMessage('Geolocation is not supported by your browser');
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse geocoding using OpenStreetMap Nominatim API
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                const address = data.display_name || `${latitude}, ${longitude}`;
                const formattedLocation = `${address} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

                setFormData(prev => ({ ...prev, location: formattedLocation }));
                setMessage('Location detected successfully!');
            } catch (error) {
                setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
                setMessage('Could not fetch address, using coordinates.');
            } finally {
                setDetectingLocation(false);
            }
        }, (error) => {
            setDetectingLocation(false);
            setMessage('Unable to retrieve your location. Please allow access.');
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('http://localhost:5003/api/urban/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    images: images
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Complaint submitted successfully!');
                setFormData({ ...formData, title: '', description: '', location: '', priority: 'Medium' });
                setImages([]);
                router.refresh();
            } else {
                setMessage(data.error || 'Failed to submit complaint');
            }
        } catch (error) {
            setMessage('Network error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low': return 'bg-brand-100 text-brand-500 border-brand-200';
            case 'Medium': return 'bg-brand-100 text-brand-600 border-brand-200';
            case 'High': return 'bg-brand-200 text-brand-700 border-brand-300';
            case 'Urgent': return 'bg-brand-300 text-brand-900 border-brand-400';
            default: return 'bg-brand-50 text-brand-600 border-brand-100';
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-brand-100 relative overflow-hidden">
            <h2 className="text-xl font-dm-sans font-bold mb-6 text-brand-900 flex items-center gap-3">
                <span className="p-2 bg-brand-50 rounded-lg">
                    <FileText className="w-5 h-5 text-brand-400" />
                </span>
                File a Complaint
            </h2>

            {message && (
                <div className={`p-4 mb-6 rounded-lg text-sm font-inter font-medium flex items-center gap-3 ${message.includes('success') || message.includes('Location detected') ? 'bg-brand-50 text-brand-500 border border-brand-100' : 'bg-brand-100 text-brand-700 border border-brand-200'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Complaint Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-all outline-none font-inter text-brand-900"
                        placeholder="Briefly describe the issue..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Category</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-brand-300 appearance-none outline-none cursor-pointer font-inter text-brand-900"
                            >
                                <option>Water</option>
                                <option>Electricity</option>
                                <option>Road</option>
                                <option>Waste Management</option>
                                <option>Sanitation</option>
                                <option>Other</option>
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-brand-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Location</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-brand-300 transition-all outline-none font-inter text-brand-900 pr-10"
                                placeholder="Start typing address..."
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-brand-100 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {suggestions.map((place: any, idx: number) => (
                                        <li
                                            key={idx}
                                            onClick={() => handleSelectLocation(place)}
                                            className="px-4 py-3 hover:bg-brand-50 cursor-pointer text-sm font-inter text-brand-900 border-b border-brand-50 last:border-none"
                                        >
                                            {place.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={detectingLocation}
                                className="absolute right-3 top-3 text-brand-400 hover:text-brand-600 transition-colors"
                                title="Detect my location"
                            >
                                {detectingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Priority Selection */}
                <div>
                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Priority Level</label>
                    <div className="flex flex-wrap gap-2">
                        {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                            <button
                                key={priority}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority })}
                                className={`px-4 py-2 rounded-lg border-2 font-inter font-medium text-sm transition-all ${formData.priority === priority
                                    ? getPriorityColor(priority) + ' ring-2 ring-offset-1 ring-brand-300'
                                    : 'bg-brand-50 text-brand-500 border-brand-100 hover:bg-brand-100'
                                    }`}
                            >
                                {priority}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">Detailed Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-brand-300 transition-all outline-none resize-none font-inter text-brand-900"
                        placeholder="Please provide specific details about the problem..."
                    ></textarea>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-dm-sans font-semibold text-brand-700 mb-2">
                        Attach Photos <span className="text-brand-400 font-inter font-normal">(optional, max 3)</span>
                    </label>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    {/* Image preview grid */}
                    <div className="flex flex-wrap gap-3 mb-3">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-brand-100 group">
                                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-brand-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {images.length < 3 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-lg border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center gap-1 text-brand-400 hover:text-brand-500"
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-xs font-inter">Upload</span>
                            </button>
                        )}
                    </div>

                    {images.length === 0 && (
                        <p className="text-xs text-brand-400 font-inter">Click to upload photos of the issue</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-400 text-white font-dm-sans font-bold py-4 rounded-lg shadow-lg shadow-brand-100 hover:bg-brand-500 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">...</span> Submitting...
                        </>
                    ) : (
                        <>Submit Complaint</>
                    )}
                </button>
            </form>
        </div>
    );
}
