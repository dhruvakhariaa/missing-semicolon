'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Tractor,
    Sprout,
    CloudSun,
    AlertTriangle,
    Droplets,
    CalendarDays,
    Menu,
    Phone,
    MessageSquare,
    Plus,
    Leaf,
    Sun,
    CloudRain,
    Wind,
    Thermometer,
    CloudLightning
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LandParcelList } from '@/components/agriculture/LandParcelList';
import { AdvisoryDashboard } from '@/components/agriculture/AdvisoryDashboard';

interface WeatherData {
    day: string;
    temp: number;
    condition: string;
    rainChance: number;
    alert: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [farmerId, setFarmerId] = useState<string | null>(null);
    const [farmerName, setFarmerName] = useState('Farmer');
    const [weather, setWeather] = useState<WeatherData[]>([]);
    const [parcels, setParcels] = useState<any[]>([]);
    const [schemes, setSchemes] = useState<any[]>([]);

    // UI State for Modals
    const [isAddParcelOpen, setIsAddParcelOpen] = useState(false);
    const [isEditParcelOpen, setIsEditParcelOpen] = useState(false);
    const [isSoilCardOpen, setIsSoilCardOpen] = useState(false);
    const [isIrrigationModalOpen, setIsIrrigationModalOpen] = useState(false);
    const [selectedParcel, setSelectedParcel] = useState<any>(null);
    const [editSowingDate, setEditSowingDate] = useState('');

    const [newParcel, setNewParcel] = useState({
        surveyNumber: '',
        area: '',
        village: '',
        irrigationType: 'Rainfed',
        currentCrop: '',
        sowingDate: ''
    });

    const updateParcel = async (parcelId: string, updates: any) => {
        try {
            const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}/land/${parcelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                // Refresh data
                setParcels(data.data);
                // Also update selected parcel if open
                const updated = data.data.find((p: any) => p._id === parcelId);
                if (updated) setSelectedParcel(updated);
            }
        } catch (error) {
            console.error("Failed to update parcel", error);
        }
    };

    useEffect(() => {
        // Default to a specific farmer ID if not found (for dev/demo since login is separate)
        const id = localStorage.getItem('farmerId') || '65a000000000000000000001';
        setFarmerId(id);

        // Fetch Farmer Profile & Parcels
        fetch(`http://localhost:3002/api/agriculture/farmers/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFarmerName(data.data.name || 'Varun Patel');
                    setParcels(data.data.landParcels || []);
                }
            })
            .catch(err => {
                console.error("Failed to fetch farmer data", err);
                // Fallback mock data if server is down or ID invalid
                setFarmerName('Varun Patel');
                setParcels([
                    { _id: '1', surveyNumber: '102/A', area: 2.5, village: 'Rampur', irrigationType: 'Rainfed', currentCrop: 'Wheat', sowingDate: '2023-11-12' },
                    { _id: '2', surveyNumber: '44/B', area: 1.8, village: 'Rampur', irrigationType: 'Rainfed', currentCrop: 'Rice', sowingDate: '2023-08-15' }
                ]);
            });

        // Fetch Schemes
        fetch(`http://localhost:3002/api/agriculture/schemes`)
            .then(res => res.json())
            .then(data => data.success && setSchemes(data.data));

        // Fetch Weather
        fetch(`http://localhost:3002/api/agriculture/weather?location=Paithan`)
            .then(res => res.json())
            .then(data => data.success && setWeather(data.data.forecast))
            .catch(() => {
                setWeather([
                    { day: 'Today', temp: 28, condition: 'Sunny', rainChance: 0, alert: 'Normal' },
                    { day: 'Tom', temp: 25, condition: 'Heavy Rain', rainChance: 90, alert: 'Warning' }
                ]);
            });
    }, []); // Removed router dependency

    const handleAddParcel = async () => {
        if (!farmerId) return;
        try {
            const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}/land`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParcel)
            });
            const data = await res.json();
            if (data.success) {
                // If backend returns updated keys, interpret them
                if (Array.isArray(data.data)) {
                    setParcels(data.data);
                } else if (data.data && data.data.landParcels) {
                    setParcels(data.data.landParcels);
                } else {
                    // Refetch as fallback
                    const refreshRes = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}`);
                    const refreshData = await refreshRes.json();
                    if (refreshData.success) setParcels(refreshData.data.landParcels);
                }
                setIsAddParcelOpen(false);
                setNewParcel({ surveyNumber: '', area: '', village: '', irrigationType: 'Rainfed', currentCrop: '', sowingDate: '' });
            }
        } catch (error) {
            console.error("Failed to add parcel", error);
        }
    };

    if (!farmerId) return null;

    // Calculate total acres
    const totalAcres = parcels.reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);
    const irrigatedAcres = parcels.filter(p => p.irrigationType !== 'Rainfed').reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);
    const rainfedAcres = parcels.filter(p => p.irrigationType === 'Rainfed').reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);

    // Extract unique crops from parcels for personalization
    const farmerCrops = Array.from(new Set(parcels.map(p => p.currentCrop).filter(Boolean)));

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Global Header */}
            <header className="bg-white sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/emblem.jpg" alt="Emblem" className="h-full w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight">Jan Sewa Portal</span>
                            <span className="text-xs text-gray-500 font-medium tracking-wide">Government of India</span>
                        </div>
                    </div>

                    {/* Navigation Links - Wireframe Style */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                        <a href="#" className="hover:text-sky-800 transition-colors">Healthcare</a>
                        <a href="#" className="text-sky-900 border-b-2 border-sky-900 pb-1">Agriculture</a>
                        <a href="#" className="hover:text-sky-800 transition-colors">Urban Development</a>
                    </nav>
                </div>
            </header>

            {/* Hero Section - Healthcare Style Card */}
            <div className="container mx-auto px-4 mt-8">
                <div className="rounded-3xl bg-gradient-to-r from-sky-900 to-blue-600 p-8 md:p-16 text-white shadow-xl relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            PM-KISAN Enabled
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Smart Agriculture Management<br />
                            For Every Farmer
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                            Access land records, crop advisories, and direct benefit transfers seamlessly on India's unified platform.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button className="bg-white text-sky-900 hover:bg-blue-50 font-semibold px-6 py-6 rounded-xl text-base" onClick={() => setIsAddParcelOpen(true)}>
                                Add Land Parcel
                            </Button>
                            <Button variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white px-6 py-6 rounded-xl text-base">
                                Check Weather
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation Tabs & Content */}
            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="land" className="space-y-8">
                    <div className="">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-8 border-b border-gray-200">
                            <TabsTrigger
                                value="land"
                                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-base font-semibold text-gray-500 data-[state=active]:text-sky-900 transition-all hover:text-sky-700"
                            >
                                <Tractor className="h-4 w-4" />
                                My Land & Crops
                            </TabsTrigger>
                            <TabsTrigger
                                value="advisory"
                                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-base font-semibold text-gray-500 data-[state=active]:text-sky-900 transition-all hover:text-sky-700"
                            >
                                <Sprout className="h-4 w-4" />
                                Crop Advice
                            </TabsTrigger>
                            <TabsTrigger
                                value="subsidies"
                                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-base font-semibold text-gray-500 data-[state=active]:text-sky-900 transition-all hover:text-sky-700"
                            >
                                <Leaf className="h-4 w-4" />
                                Subsidies
                            </TabsTrigger>
                            <TabsTrigger
                                value="weather"
                                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-base font-semibold text-gray-500 data-[state=active]:text-sky-900 transition-all hover:text-sky-700"
                            >
                                <CloudSun className="h-4 w-4" />
                                Weather Alerts
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab: My Land & Crops */}
                    <TabsContent value="land" className="space-y-6">
                        <div className="space-y-8">
                            {/* Total Holdings Banner - Blue Gradient Design */}
                            <div className="w-full rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl"></div>

                                {/* Leaf Icon + Total Holdings */}
                                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                        <Leaf className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-1">Total Holdings</p>
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                            {totalAcres} <span className="text-xl font-medium text-blue-100">Acres</span>
                                        </h2>
                                    </div>
                                </div>

                                {/* Rainfed / Irrigated Stats - Glassy Block */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-8 min-w-[200px] justify-between relative z-10">
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium mb-1">Rainfed</p>
                                        <p className="text-xl font-bold">{rainfedAcres} Ac</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/20"></div>
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium mb-1">Irrigated</p>
                                        <p className="text-xl font-bold">{irrigatedAcres} Ac</p>
                                    </div>
                                </div>

                                {/* Water Status Alert - Gradient Block */}
                                <div className="bg-gradient-to-br from-sky-400/30 to-blue-500/30 backdrop-blur-md rounded-xl p-4 border border-white/20 relative z-10 flex items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all">
                                    <div className="h-10 w-10 bg-sky-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <Droplets className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Water Status</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white leading-tight">Irrigation Alert</p>
                                            <Badge className="bg-white/90 text-blue-600 text-[9px] hover:bg-white px-1.5 h-4">DUE TODAY</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Parcel Button */}
                                <Button
                                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold px-6 py-6 rounded-xl shadow-lg relative z-10 transition-transform active:scale-95"
                                    onClick={() => setIsAddParcelOpen(true)}
                                >
                                    + Add New Parcel
                                </Button>
                            </div>

                            {/* Active Parcels Header */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2 px-1">
                                    <Tractor className="h-5 w-5 text-blue-600" />
                                    Active Parcels
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold ml-2">{parcels.length} Found</span>
                                </h3>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {parcels.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white text-gray-400 space-y-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Plus className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-600 text-lg">No land parcels found</p>
                                                <p className="text-sm">Add your first parcel to see analytics here</p>
                                            </div>
                                            <Button variant="outline" onClick={() => setIsAddParcelOpen(true)}>Add Parcel</Button>
                                        </div>
                                    ) : (
                                        parcels.map((parcel, idx) => {
                                            const daysSown = parcel.sowingDate
                                                ? Math.floor((new Date().getTime() - new Date(parcel.sowingDate).getTime()) / (1000 * 3600 * 24))
                                                : 0;

                                            return (
                                                <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-blue-50 hover:shadow-xl transition-all duration-300 group relative overflow-visible">
                                                    {/* Decorative top-right blur */}
                                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    {/* Header: Index, Sy No, Badge */}
                                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                                                                {(idx + 1).toString().padStart(2, '0')}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-xl leading-tight">Sy. {parcel.surveyNumber}</h4>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{parcel.village}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide">
                                                            Vegetative
                                                        </span>
                                                    </div>

                                                    {/* Metrics Row */}
                                                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                                        <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
                                                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">Crop Type</p>
                                                            <div className="flex items-center gap-2">
                                                                <Sprout className="h-5 w-5 text-orange-500" />
                                                                <span className="text-lg font-bold text-gray-900">{parcel.currentCrop}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Area</p>
                                                            <div className="flex items-center gap-2">
                                                                <Leaf className="h-5 w-5 text-blue-500" />
                                                                <span className="text-lg font-bold text-gray-900">{parcel.area} Ac</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sowing Progress */}
                                                    <div className="mb-8 relative z-10">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sowing Progress</p>
                                                                <p className="text-2xl font-bold text-blue-900 mt-1">{daysSown} <span className="text-sm font-medium text-gray-400">Days</span></p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedParcel(parcel);
                                                                    setEditSowingDate(parcel.sowingDate ? parcel.sowingDate.split('T')[0] : '');
                                                                    setIsEditParcelOpen(true);
                                                                }}
                                                                className="text-gray-400 hover:text-blue-600 text-xs font-medium transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${Math.min((daysSown / 120) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Footer Actions */}
                                                    <div className="flex gap-3 relative z-10">
                                                        <button
                                                            onClick={() => { setSelectedParcel(parcel); setIsSoilCardOpen(true); }}
                                                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group/btn"
                                                        >
                                                            <Leaf className="h-4 w-4 text-gray-400 group-hover/btn:text-blue-500 transition-colors" />
                                                            Soil Card
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedParcel(parcel); setIsIrrigationModalOpen(true); }}
                                                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group/btn"
                                                        >
                                                            <Droplets className="h-4 w-4 text-gray-400 group-hover/btn:text-blue-500 transition-colors" />
                                                            Irrigation
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Crop Advice */}
                    <TabsContent value="advisory">
                        <AdvisoryDashboard crops={parcels} farmerId={farmerId || undefined} />
                    </TabsContent>

                    {/* Tab: Subsidies */}
                    <TabsContent value="subsidies">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schemes.length === 0 ? (
                                <p className="col-span-full text-center text-gray-500">No active schemes found at the moment.</p>
                            ) : (
                                schemes.map((scheme, idx) => (
                                    <Card key={idx} className="border-none shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all bg-white">
                                        <CardHeader className={`${idx % 2 === 0 ? 'bg-sky-50' : 'bg-blue-50'} pb-6`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className={`border-none ${idx % 2 === 0 ? 'bg-white text-sky-700' : 'bg-white text-blue-700'}`}>Active Scheme</Badge>
                                                <span className="text-xs text-gray-400 font-mono">#SCH-{idx + 10}</span>
                                            </div>
                                            <CardTitle className="text-lg text-gray-900 leading-tight">{scheme.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scheme.description}</p>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Benefit</p>
                                                <p className="text-sm font-semibold text-gray-900">{scheme.benefits}</p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button className={`w-full text-white rounded-xl ${idx % 2 === 0 ? 'bg-sky-600 hover:bg-sky-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Check Eligibility</Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab: Weather Alerts */}
                    <TabsContent value="weather" className="space-y-6">
                        {/* Top Row: Today's Weather + Forecast Scroll */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Prominent 'Today' Card */}
                            {weather.length > 0 && (
                                <div className="lg:w-1/3 flex-shrink-0">
                                    <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl h-full flex flex-col justify-between relative overflow-hidden group">
                                        {/* Background decoration */}
                                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>

                                        <div>
                                            <div className="flex justify-between items-start">
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">Today</span>
                                                {weather[0].alert && weather[0].alert !== 'Normal' && (
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse shadow-sm">
                                                        ⚠️ {weather[0].alert}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-8">
                                                <div className="flex items-center gap-4">
                                                    {weather[0].condition.includes('Sunny') ? <Sun className="h-20 w-20 text-yellow-300" /> :
                                                        weather[0].condition.includes('Rain') ? <CloudRain className="h-20 w-20 text-blue-200" /> :
                                                            weather[0].condition.includes('Cloud') ? <CloudSun className="h-20 w-20 text-gray-200" /> :
                                                                <Wind className="h-20 w-20 text-gray-200" />}
                                                    <div>
                                                        <h2 className="text-6xl font-bold tracking-tighter">{weather[0].temp}°</h2>
                                                        <p className="text-xl text-blue-100 font-medium mt-1">{weather[0].condition}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Precipitation</p>
                                                <p className="font-semibold">{weather[0].rainChance}%</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Humidity</p>
                                                <p className="font-semibold">64%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scrollable Forecast Row */}
                            <div className="lg:w-2/3 overflow-x-auto pb-4 scrollbar-hide">
                                <div className="flex gap-4">
                                    {weather.slice(1).map((day, idx) => (
                                        <div key={idx} className="min-w-[140px] bg-white border border-gray-100 rounded-3xl p-5 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-all hover:scale-105 duration-300 group">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day.day}</span>

                                            <div className="my-4 group-hover:scale-110 transition-transform duration-300">
                                                {day.condition.includes('Sunny') && <Sun className="h-10 w-10 text-orange-400" />}
                                                {day.condition.includes('Cloud') && <CloudSun className="h-10 w-10 text-gray-400" />}
                                                {day.condition.includes('Rain') && <CloudRain className="h-10 w-10 text-blue-500" />}
                                                {day.condition.includes('Thunder') && <CloudLightning className="h-10 w-10 text-indigo-500" />}
                                            </div>

                                            <div className="text-center">
                                                <span className="text-2xl font-bold text-gray-900 block">{day.temp}°</span>
                                                <span className="text-[10px] text-gray-500 font-medium px-2 py-1 bg-gray-50 rounded-full mt-2 inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{day.condition}</span>
                                            </div>

                                            {day.alert && day.alert !== 'Normal' && (
                                                <span className="mt-3 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">Alert</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Advisories Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-red-100/50 blur-3xl"></div>
                                <div className="flex items-start gap-4 mb-4 relative z-10">
                                    <div className="bg-red-100 p-3 rounded-2xl">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 text-lg">Active Advisory</h4>
                                        <p className="text-red-600/80 text-xs font-bold uppercase tracking-wide">Heatwave Alert</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm relative z-10">
                                    High temperatures expected. Ensure adequate irrigation for crops. Mulching is recommended to conserve soil moisture. Avoid chemical spraying during peak heat hours (12 PM - 3 PM).
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-red-900/40 uppercase tracking-wider relative z-10">
                                    <span>Issued by IMD</span>
                                    <span>•</span>
                                    <span>Updated Just Now</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl"></div>
                                <div className="flex items-start gap-4 mb-4 relative z-10">
                                    <div className="bg-blue-100 p-3 rounded-2xl">
                                        <Droplets className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-lg">Farming Recommendation</h4>
                                        <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wide">Irrigation Management</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm relative z-10">
                                    Take precautionary measures for crops based on the active advisory. Ensure proper drainage or moisture conservation as needed. For cotton, ensure soil moisture checks before fertilization.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>


            {/* Add Parcel Modal */}
            {isAddParcelOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full text-gray-900 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Add New Land Parcel</h3>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Survey No.</label>
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newParcel.surveyNumber}
                                        onChange={e => setNewParcel({ ...newParcel, surveyNumber: e.target.value })}
                                        placeholder="e.g. 102/A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Area (Acres)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newParcel.area}
                                        onChange={e => setNewParcel({ ...newParcel, area: e.target.value })}
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Village</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newParcel.village}
                                    onChange={e => setNewParcel({ ...newParcel, village: e.target.value })}
                                    placeholder="Village Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Crop</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newParcel.currentCrop}
                                    onChange={e => setNewParcel({ ...newParcel, currentCrop: e.target.value })}
                                    placeholder="e.g. Wheat, Cotton"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setIsAddParcelOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddParcel}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                >
                                    Save Parcel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Parcel Modal */}
            {isEditParcelOpen && selectedParcel && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full text-gray-900 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Edit Parcel Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Sown Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                    value={editSowingDate}
                                    onChange={(e) => setEditSowingDate(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => setIsEditParcelOpen(false)}>Cancel</Button>
                                <Button
                                    size="sm"
                                    className="bg-blue-600 text-white"
                                    onClick={async () => {
                                        await updateParcel(selectedParcel._id, {
                                            sowingDate: editSowingDate || null
                                        });
                                        setIsEditParcelOpen(false);
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Soil Card Modal */}
            {isSoilCardOpen && selectedParcel && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full text-gray-900 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Soil Health Card</h3>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Healthy</div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500">pH Level</p>
                                    <p className="text-xl font-bold text-gray-900">{selectedParcel.soilDetails?.ph || '6.5'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500">Organic Carbon</p>
                                    <p className="text-xl font-bold text-gray-900">0.75%</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Nutrient Status (Kg/Ha)</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Nitrogen (N)</span>
                                        <span className="font-medium">{selectedParcel.soilDetails?.nitrogen || '240'} (Low)</span>
                                    </div>
                                    <Progress value={40} className="h-1.5" />
                                    <div className="flex justify-between">
                                        <span>Phosphorus (P)</span>
                                        <span className="font-medium">{selectedParcel.soilDetails?.phosphorus || '18'} (Medium)</span>
                                    </div>
                                    <Progress value={60} className="h-1.5" />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded">
                                <h4 className="font-semibold text-blue-900 text-sm mb-1">Recommendation</h4>
                                <p className="text-xs text-blue-800">Apply 40kg Urea per acre as top dressing. Consult local agricultural officer for micro-nutrient mix.</p>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => setIsSoilCardOpen(false)}>Close</Button>
                                <Button size="sm" className="bg-blue-600 text-white" onClick={() => { /* Open edit for soil logic */ }}>Update Data</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Irrigation Modal */}
            {isIrrigationModalOpen && selectedParcel && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full text-gray-900 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-blue-500" />
                            Irrigation Schedule
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Last Irrigated</span>
                                <span className="font-medium">{selectedParcel.lastIrrigationDate ? new Date(selectedParcel.lastIrrigationDate).toLocaleDateString() : 'Not recorded'}</span>
                            </div>

                            <div className="bg-blue-50 p-4 rounded text-center">
                                <p className="text-sm text-blue-800 mb-1">Next Irrigation Due</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {selectedParcel.lastIrrigationDate
                                        ? new Date(new Date(selectedParcel.lastIrrigationDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                        : 'Today'}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Based on current weather and crop stage</p>
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    updateParcel(selectedParcel._id, { lastIrrigationDate: new Date().toISOString() });
                                    setIsIrrigationModalOpen(false);
                                }}
                            >
                                Log Irrigation Today
                            </Button>
                            <Button variant="ghost" className="w-full text-gray-500" onClick={() => setIsIrrigationModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
