'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Tractor, Sprout, CloudSun, AlertTriangle, Droplets, CalendarDays, Menu, Phone, MessageSquare, Plus, Leaf, Sun, CloudRain, Wind, Thermometer, CloudLightning, Cloud, CloudFog
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LandParcelList } from '@/components/agriculture/LandParcelList';
import { AdvisoryDashboard } from '@/components/agriculture/AdvisoryDashboard';
import { AgricultureChatbot } from '@/components/agriculture/AgricultureChatbot';

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
    const [selectedScheme, setSelectedScheme] = useState<any>(null);
    const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);

    // Application & Profile State
    const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
    const [farmerProfile, setFarmerProfile] = useState<any>(null);
    const [enrolledSchemes, setEnrolledSchemes] = useState<any[]>([]);
    const [applicationForm, setApplicationForm] = useState({
        bankAccount: '',
        category: 'Small (< 2ha / 5 acres)',
        declaration: false
    });

    const [newParcel, setNewParcel] = useState({
        surveyNumber: '', area: '', village: '', irrigationType: 'Rainfed', currentCrop: '', sowingDate: ''
    });

    // Edit State
    const [editingSoil, setEditingSoil] = useState(false);
    const [soilForm, setSoilForm] = useState({ ph: '', nitrogen: '', phosphorus: '', organicCarbon: '0.75' });
    const [irrigationDateInput, setIrrigationDateInput] = useState('');

    useEffect(() => {
        if (farmerId) {
            fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setFarmerProfile(data.data);
                        if (data.data.landParcels) setParcels(data.data.landParcels);
                        if (data.data.enrolledSchemes) setEnrolledSchemes(data.data.enrolledSchemes);
                    }
                })
                .catch(err => console.error("Failed to fetch profile", err));
        }
    }, [farmerId]);

    const updateParcel = async (parcelId: string, updates: any) => {
        try {
            const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}/land/${parcelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                setParcels(data.data);
                // Ensure ID comparison is safe
                const updated = data.data.find((p: any) => String(p._id) === String(parcelId));
                if (updated) setSelectedParcel({ ...updated }); // Spread to ensure new reference
            }
        } catch (error) { console.error("Failed to update parcel", error); }
    };

    const checkEligibility = (scheme: any) => {
        if (!scheme.criteria) return { qualified: true, reason: "Open to all eligible farmers." };

        const totalArea = parcels.reduce((sum, p) => sum + (Number(p.area) || 0), 0);
        const allCrops = parcels.map(p => p.currentCrop).filter(Boolean);

        if (scheme.criteria.type === 'land_holding') {
            if (scheme.criteria.maxArea && totalArea > scheme.criteria.maxArea) {
                return { qualified: false, reason: `Total land holding (${totalArea} acres) exceeds limit of ${scheme.criteria.maxArea} acres.` };
            }
            if (scheme.criteria.minArea && totalArea < scheme.criteria.minArea) {
                return { qualified: false, reason: `Total land holding (${totalArea} acres) is less than required ${scheme.criteria.minArea} acres.` };
            }
        }

        if (scheme.criteria.type === 'crop_based') {
            const hasRequiredCrop = scheme.criteria.requiredCrops.some((c: string) =>
                allCrops.some(farmerCrop => farmerCrop.toLowerCase().includes(c.toLowerCase()))
            );
            if (!hasRequiredCrop) {
                return { qualified: false, reason: `Required crops (${scheme.criteria.requiredCrops.join(', ')}) not found in your active parcels.` };
            }
        }

        return { qualified: true, reason: "You meet all the criteria based on your land and crop details." };
    };

    useEffect(() => {
        const id = localStorage.getItem('farmerId') || '65a000000000000000000001';
        setFarmerId(id);
        fetch(`http://localhost:3002/api/agriculture/farmers/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setFarmerName(data.data.name || 'Varun Patel');
                    setParcels(data.data.landParcels || []);

                    // Fetch weather for farmer's location
                    const loc = data.data.village ? `${data.data.village}, ${data.data.district || ''}` : 'Paithan';
                    fetch(`http://localhost:3002/api/agriculture/weather?location=${encodeURIComponent(loc)}`)
                        .then(res => res.json()).then(wData => {
                            if (wData.success) {
                                let forecast = wData.data.forecast || [];
                                if (forecast.length < 7) {
                                    const extraDays = [
                                        { day: 'Fri', temp: 31, condition: 'Sunny', rainChance: 0, alert: 'Heatwave Alert' },
                                        { day: 'Sat', temp: 26, condition: 'Rain', rainChance: 60, alert: 'Rain Advisory' },
                                        { day: 'Sun', temp: 28, condition: 'Cloudy', rainChance: 20, alert: 'Normal' },
                                        { day: 'Mon', temp: 29, condition: 'Partly Cloudy', rainChance: 10, alert: 'Normal' }
                                    ];
                                    forecast = [...forecast, ...extraDays.slice(0, 7 - forecast.length)];
                                }
                                setWeather(forecast);
                            }
                        })
                        .catch(() => {
                            // Fallback if weather API fails
                            setWeather([
                                { day: 'Today', temp: 28, condition: 'Sunny', rainChance: 0, alert: 'Normal' },
                                { day: 'Tom', temp: 25, condition: 'Cloudy', rainChance: 20, alert: 'Normal' },
                                { day: 'Wed', temp: 28, condition: 'Cloudy', rainChance: 30, alert: 'Normal' },
                                { day: 'Thu', temp: 27, condition: 'Sunny', rainChance: 5, alert: 'Normal' },
                                { day: 'Fri', temp: 31, condition: 'Sunny', rainChance: 0, alert: 'Heatwave Alert' },
                                { day: 'Sat', temp: 26, condition: 'Rain', rainChance: 60, alert: 'Rain Advisory' },
                                { day: 'Sun', temp: 28, condition: 'Cloudy', rainChance: 20, alert: 'Normal' }
                            ]);
                        });
                }
            })
            .catch(err => {
                console.error("Failed to fetch farmer data", err);
                setFarmerName('Varun Patel');
                // Also parse fallback weather if farmer fetch fails (since weather fetch is nested)
                setWeather([
                    { day: 'Today', temp: 28, condition: 'Sunny', rainChance: 0, alert: 'Normal' },
                    { day: 'Tom', temp: 25, condition: 'Cloudy', rainChance: 20, alert: 'Normal' },
                    { day: 'Wed', temp: 28, condition: 'Cloudy', rainChance: 30, alert: 'Normal' },
                    { day: 'Thu', temp: 27, condition: 'Sunny', rainChance: 5, alert: 'Normal' },
                    { day: 'Fri', temp: 31, condition: 'Sunny', rainChance: 0, alert: 'Heatwave Alert' },
                    { day: 'Sat', temp: 26, condition: 'Rain', rainChance: 60, alert: 'Rain Advisory' },
                    { day: 'Sun', temp: 28, condition: 'Cloudy', rainChance: 20, alert: 'Normal' }
                ]);
            });

        fetch(`http://localhost:3002/api/agriculture/schemes`).then(res => res.json()).then(data => data.success && setSchemes(data.data));
    }, []);

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
                if (Array.isArray(data.data)) { setParcels(data.data); } else if (data.data && data.data.landParcels) { setParcels(data.data.landParcels); } else {
                    const refreshRes = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}`);
                    const refreshData = await refreshRes.json();
                    if (refreshData.success) setParcels(refreshData.data.landParcels);
                }
                setIsAddParcelOpen(false);
                setNewParcel({ surveyNumber: '', area: '', village: '', irrigationType: 'Rainfed', currentCrop: '', sowingDate: '' });
            }
        } catch (error) { console.error("Failed to add parcel", error); }
    };

    if (!farmerId) return null;

    const totalAcres = parcels.reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);
    const irrigatedAcres = parcels.filter(p => p.irrigationType !== 'Rainfed').reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);
    const rainfedAcres = parcels.filter(p => p.irrigationType === 'Rainfed').reduce((acc, curr) => acc + (Number(curr.area) || 0), 0).toFixed(1);
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
                            <img src="/images/emblem.jpg" alt="Emblem" className="h-full w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight">Service Delivery Platform</span>
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

            {/* Hero Section */}
            {/* Hero Section - Healthcare Style Card */}
            <div className="container mx-auto px-4 mt-8">
                <div className="rounded-3xl bg-gradient-to-r from-sky-900 to-blue-600 p-8 md:p-16 text-white shadow-xl relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            PM-KISAN Enabled
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Smart Agriculture Management<br />
                            For Every Farmer
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                            Access land records, crop advisories, and direct benefit transfers seamlessly on India's unified platform.
                        </p>

                    </div>
                </div>
            </div>

            {/* Main Tabs */}
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

                    <TabsContent value="land" className="space-y-8">
                        {/* Horizontal Total Holdings Bar */}
                        <Card className="border-none shadow-xl bg-[#2B85CF] text-white rounded-3xl overflow-hidden relative">
                            {/* Decorative Background Pattern */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-black/10 blur-2xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shadow-inner shrink-0">
                                        <Leaf className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-blue-50 text-sm font-bold uppercase tracking-widest mb-1">Total Holdings</CardTitle>
                                        <h3 className="text-5xl font-extrabold flex items-baseline gap-2 text-white leading-none">
                                            {totalAcres} <span className="text-xl font-medium text-blue-100">Acres</span>
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex flex-1 w-full md:w-auto items-center justify-center gap-4 px-8">
                                    {Number(irrigatedAcres) > 0 && (
                                        <div className="flex-1 max-w-xs flex justify-between items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                            <span className="text-blue-50 font-medium">Irrigated</span>
                                            <span className="font-bold text-white text-xl">{irrigatedAcres} Ac</span>
                                        </div>
                                    )}
                                    <div className="flex-1 max-w-xs flex justify-between items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <span className="text-blue-50 font-medium">Rainfed</span>
                                        <span className="font-bold text-white text-xl">{rainfedAcres} Ac</span>
                                    </div>

                                    {/* Irrigation Notification */}
                                    {(() => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const notification = parcels.map(parcel => {
                                            if (!parcel.lastIrrigationDate || !parcel.currentCrop) return null;

                                            const lastIrrigated = new Date(parcel.lastIrrigationDate);
                                            lastIrrigated.setHours(0, 0, 0, 0);
                                            const diffTime = Math.abs(today.getTime() - lastIrrigated.getTime());
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                            let interval = 7; // Default
                                            const crop = parcel.currentCrop.toLowerCase();
                                            if (crop.includes('wheat')) interval = 10; // Wheat: Every 10-12 days
                                            else if (crop.includes('cotton')) interval = 7; // Cotton: Every 7-10 days
                                            else if (crop.includes('mango')) interval = 15; // Mango: Every 15 days

                                            const daysOverdue = diffDays - interval;

                                            // Trigger if due today or past due
                                            if (daysOverdue >= 0) {
                                                return { crop: parcel.currentCrop, survey: parcel.surveyNumber, days: diffDays };
                                            }
                                            return null;
                                        }).filter(Boolean)[0]; // Just show first urgent one for space

                                        if (notification) {
                                            return (
                                                <div className="flex-1 max-w-xs flex flex-col justify-center p-4 bg-gradient-to-br from-cyan-400 to-blue-700 text-white rounded-2xl shadow-xl shadow-cyan-500/20 border-2 border-white/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                                    {/* Shine Effect */}
                                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/20 blur-2xl rounded-full"></div>
                                                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-blue-500/30 blur-xl rounded-full"></div>

                                                    <div className="flex items-center gap-2 mb-1 relative z-10">
                                                        <div className="p-1.5 bg-white/20 rounded-full animate-pulse ring-1 ring-white/40">
                                                            <Droplets className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-bold text-xs uppercase tracking-widest text-cyan-50 drop-shadow-sm">Irrigation Alert</span>
                                                    </div>
                                                    <div className="relative z-10">
                                                        <span className="font-black text-lg leading-tight block text-white drop-shadow-md">
                                                            {notification.crop}
                                                        </span>
                                                        <div className="flex justify-between items-end mt-2">
                                                            <span className="text-xs font-semibold text-blue-100 bg-blue-900/30 px-2.5 py-1 rounded-lg border border-white/10">Sy. {notification.survey}</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-900 bg-cyan-50 px-2.5 py-1 rounded-full shadow-sm">Due Today</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <Button
                                    className="w-full md:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl py-6 px-8 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                                    onClick={() => setIsAddParcelOpen(true)}
                                >
                                    + Add New Parcel
                                </Button>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Tractor className="h-5 w-5 text-blue-700" />
                                    </div>
                                    Active Parcels
                                </h3>
                                <span className="text-sm text-gray-500 font-medium">{parcels.length} Parcels Found</span>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {parcels.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setIsAddParcelOpen(true)}>
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                            <Plus className="h-10 w-10 text-gray-300" />
                                        </div>
                                        <p className="font-bold text-lg text-gray-600">No land parcels found</p>
                                        <p className="text-sm mt-1 mb-6">Add your first parcel to get started</p>
                                        <Button variant="outline">Add Parcel Now</Button>
                                    </div>
                                ) : (
                                    parcels.map((parcel, idx) => {
                                        const daysSown = parcel.sowingDate
                                            ? Math.floor((new Date().getTime() - new Date(parcel.sowingDate).getTime()) / (1000 * 3600 * 24))
                                            : 0;

                                        return (
                                            <Card key={idx} className="hover:shadow-xl hover:border-blue-300 transition-all duration-300 border border-gray-200 shadow-sm rounded-2xl overflow-hidden group bg-white">
                                                <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black text-sm shadow-sm ring-1 ring-gray-100">
                                                                {parcel.surveyNumber.slice(0, 2)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 leading-tight text-lg">Sy. {parcel.surveyNumber}</h4>
                                                                <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide uppercase">{parcel.village}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 font-bold shadow-sm">Vegetative</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-5 space-y-5">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-50">
                                                            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Crop Type</p>
                                                            <p className="font-bold text-gray-900 flex items-center gap-2 text-base">
                                                                <Sprout className="h-4 w-4 text-orange-500" />
                                                                {parcel.currentCrop}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-50">
                                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Area</p>
                                                            <p className="font-bold text-gray-900 flex items-center gap-2 text-base">
                                                                <Leaf className="h-4 w-4 text-blue-500" />
                                                                {parcel.area} Ac
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sowing Progress</p>
                                                                <p className="text-lg font-black text-gray-800 mt-0.5">
                                                                    {daysSown >= 0 ? `${daysSown} Days` : 'Not Sown'}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedParcel(parcel);
                                                                    setEditSowingDate(parcel.sowingDate ? parcel.sowingDate.split('T')[0] : '');
                                                                    setIsEditParcelOpen(true);
                                                                }}
                                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all"
                                                            >
                                                                <div className="text-sm font-bold">Edit</div>
                                                            </button>
                                                        </div>
                                                        <Progress value={Math.min((daysSown / 120) * 100, 100)} className="h-2 bg-gray-200 [&>*]:bg-blue-600" />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                                        <Button size="sm" variant="outline" className="w-full font-semibold text-xs border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-gray-600 rounded-xl h-10 transition-colors" onClick={() => {
                                                            setSelectedParcel(parcel);
                                                            setSoilForm({
                                                                ph: parcel.soilDetails?.ph || '6.5',
                                                                nitrogen: parcel.soilDetails?.nitrogen || '240',
                                                                phosphorus: parcel.soilDetails?.phosphorus || '18',
                                                                organicCarbon: parcel.soilDetails?.organicCarbon || '0.75'
                                                            });
                                                            setEditingSoil(false);
                                                            setIsSoilCardOpen(true);
                                                        }}>
                                                            <Leaf className="w-3 h-3 mr-2" />
                                                            Soil Card
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="w-full font-semibold text-xs border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-gray-600 rounded-xl h-10 transition-colors" onClick={() => {
                                                            setSelectedParcel(parcel);
                                                            setIrrigationDateInput(new Date().toISOString().split('T')[0]);
                                                            setIsIrrigationModalOpen(true);
                                                        }}>
                                                            <Droplets className="w-3 h-3 mr-2" />
                                                            Irrigation
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="advisory">
                        {/* Ensure farmerId is passed even if null, though Dashboard handles it */}
                        <AdvisoryDashboard crops={parcels} farmerId={farmerId || undefined} />
                    </TabsContent>
                    <TabsContent value="subsidies">                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemes.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">No active schemes found at the moment.</p>
                        ) : (
                            schemes.map((scheme, idx) => (
                                <Card key={idx} className="flex flex-col h-full hover:shadow-xl hover:border-blue-300 transition-all duration-300 border border-gray-200 shadow-sm rounded-2xl overflow-hidden group bg-white">
                                    <CardHeader className={`${idx % 2 === 0 ? 'bg-sky-50' : 'bg-blue-50'} pb-6`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge className={`border-none ${idx % 2 === 0 ? 'bg-white text-sky-700' : 'bg-white text-blue-700'}`}>Active Scheme</Badge>
                                            <span className="text-xs text-gray-400 font-mono">#SCH-{idx + 10}</span>
                                        </div>
                                        <CardTitle className="text-lg text-gray-900 leading-tight">{scheme.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex-1">
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scheme.description}</p>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Benefit</p>
                                            <p className="text-sm font-semibold text-gray-900">{scheme.benefits}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button
                                            className={`w-full text-white rounded-xl ${idx % 2 === 0 ? 'bg-sky-600 hover:bg-sky-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            onClick={() => {
                                                setSelectedScheme(scheme);
                                                setIsEligibilityModalOpen(true);
                                            }}
                                        >
                                            Check Eligibility
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div> </TabsContent>
                    <TabsContent value="weather" className="space-y-8">
                        {/* Daily Forecast Scrollable Strip */}
                        <div className="relative">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {weather.map((day, idx) => {
                                    const isToday = idx === 0;
                                    return (
                                        <Card key={idx} className={`border-none shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 ${isToday
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-50 relative overflow-hidden col-span-2 md:col-span-1 lg:col-span-1'
                                            : day.condition.includes('Rain') ? 'bg-blue-50' : 'bg-white'
                                            }`}>
                                            {isToday && (
                                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                                    <CloudSun className="h-16 w-16 -mr-4 -mt-4" />
                                                </div>
                                            )}
                                            <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full justify-between gap-1">
                                                <div className="flex flex-col items-center w-full">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {isToday ? 'Today' : day.day}
                                                    </span>

                                                    {day.condition.includes('Sunny') && <Sun className={`h-6 w-6 mb-1 ${isToday ? 'text-yellow-300' : 'text-orange-400'}`} />}
                                                    {day.condition.includes('Partly') && <CloudSun className={`h-6 w-6 mb-1 ${isToday ? 'text-blue-200' : 'text-gray-400'}`} />}
                                                    {day.condition.includes('Cloudy') && <Cloud className={`h-6 w-6 mb-1 ${isToday ? 'text-blue-200' : 'text-gray-400'}`} />}
                                                    {day.condition.includes('Rain') && <CloudRain className={`h-6 w-6 mb-1 ${isToday ? 'text-blue-200' : 'text-blue-500'}`} />}
                                                    {day.condition.includes('Thunder') && <CloudLightning className={`h-6 w-6 mb-1 ${isToday ? 'text-yellow-200' : 'text-indigo-500'}`} />}
                                                    {day.condition.includes('Fog') && <CloudFog className={`h-6 w-6 mb-1 ${isToday ? 'text-blue-200' : 'text-gray-400'}`} />}

                                                    <span className={`text-xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>{day.temp}°</span>
                                                </div>

                                                <div className="w-full flex flex-col items-center gap-1">
                                                    <span className={`text-[9px] truncate w-full px-1.5 py-0.5 rounded-full whitespace-nowrap ${isToday ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {day.condition}
                                                    </span>

                                                    {day.alert && day.alert !== 'Normal' && (
                                                        <Badge variant="destructive" className="w-full justify-center text-[9px] py-0 h-4 bg-red-500">Alert</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Alerts Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-red-50 border-none rounded-2xl p-6 relative overflow-hidden">
                                {weather.some(d => d.alert && d.alert !== 'Normal') ? (
                                    (() => {
                                        const alertDay = weather.find(d => d.alert && d.alert !== 'Normal') || weather[0];
                                        const isRain = alertDay?.alert?.includes('Rain') || alertDay?.alert?.includes('Thunderstorm');
                                        const isHeat = alertDay?.alert?.includes('Heat');

                                        return (
                                            <>
                                                <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-red-100 blur-2xl"></div>
                                                <div className="flex items-center gap-2 mb-2 relative z-10">
                                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                                    <h3 className="font-bold text-red-900 text-lg">Active Advisory</h3>
                                                </div>
                                                <h4 className="font-semibold text-red-800 text-base mb-1 relative z-10">{alertDay?.alert}</h4>
                                                <p className="text-red-700/80 text-sm leading-relaxed relative z-10">
                                                    {isRain
                                                        ? `Heavy rainfall expected on ${alertDay?.day}. Postpone chemical spraying operations.`
                                                        : isHeat
                                                            ? `High temperatures expected on ${alertDay?.day}. Ensure adequate irrigation.`
                                                            : `Severe weather conditions expected on ${alertDay?.day}. Take necessary precautions.`}
                                                </p>
                                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-900/60 uppercase tracking-wider relative z-10">
                                                    <span>Issued by IMD</span>
                                                    <span>•</span>
                                                    <span>Updated Just Now</span>
                                                </div>
                                            </>
                                        );
                                    })()
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                <Leaf className="h-3 w-3 text-green-600" />
                                            </div>
                                            <h3 className="font-bold text-green-900 text-lg">No Active Alerts</h3>
                                        </div>
                                        <p className="text-green-800/80 text-sm leading-relaxed">
                                            Weather conditions are favorable for agricultural operations. No severe weather warnings for your location.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="bg-blue-50 border-none rounded-2xl p-6 flex flex-col justify-center">
                                <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2 mb-2">
                                    <Droplets className="h-5 w-5 text-blue-500" />
                                    Farming Recommendation
                                </h3>
                                <p className="text-blue-800/80 text-sm leading-relaxed">
                                    {weather.some(d => d.alert && d.alert !== 'Normal')
                                        ? "Take precautionary measures for crops based on the active advisory. Ensure proper drainage or moisture conservation as needed."
                                        : "Continue with routine agricultural activities. Ideal time for fertilizer application and irrigation as per crop stage."
                                    }
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
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
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={newParcel.surveyNumber}
                                        onChange={e => setNewParcel({ ...newParcel, surveyNumber: e.target.value })}
                                        placeholder="e.g. 102/A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Area (Acres)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={newParcel.area}
                                        onChange={e => setNewParcel({ ...newParcel, area: e.target.value })}
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Village</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={newParcel.village}
                                    onChange={e => setNewParcel({ ...newParcel, village: e.target.value })}
                                    placeholder="Village Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Crop</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
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
                                    className="bg-green-600 text-white"
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
                            {!editingSoil && <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</div>}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500">pH Level</p>
                                    {editingSoil ? (
                                        <input className="w-full text-center border rounded mt-1" value={soilForm.ph} onChange={e => setSoilForm({ ...soilForm, ph: e.target.value })} />
                                    ) : (
                                        <p className="text-xl font-bold text-gray-900">{selectedParcel.soilDetails?.ph || '6.5'}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500">Organic Carbon</p>
                                    {editingSoil ? (
                                        <input className="w-full text-center border rounded mt-1" value={soilForm.organicCarbon} onChange={e => setSoilForm({ ...soilForm, organicCarbon: e.target.value })} />
                                    ) : (
                                        <p className="text-xl font-bold text-gray-900">{selectedParcel.soilDetails?.organicCarbon || '0.75'}%</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Nutrient Status (Kg/Ha)</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span>Nitrogen (N)</span>
                                        {editingSoil ? (
                                            <input className="w-20 text-center border rounded" value={soilForm.nitrogen} onChange={e => setSoilForm({ ...soilForm, nitrogen: e.target.value })} />
                                        ) : (
                                            <span className="font-medium">{selectedParcel.soilDetails?.nitrogen || '240'} (Low)</span>
                                        )}
                                    </div>
                                    <Progress value={40} className="h-1.5" />
                                    <div className="flex justify-between items-center">
                                        <span>Phosphorus (P)</span>
                                        {editingSoil ? (
                                            <input className="w-20 text-center border rounded" value={soilForm.phosphorus} onChange={e => setSoilForm({ ...soilForm, phosphorus: e.target.value })} />
                                        ) : (
                                            <span className="font-medium">{selectedParcel.soilDetails?.phosphorus || '18'} (Medium)</span>
                                        )}
                                    </div>
                                    <Progress value={60} className="h-1.5" />
                                </div>
                            </div>

                            {!editingSoil && (
                                <div className="bg-blue-50 p-3 rounded">
                                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Recommendation</h4>
                                    <p className="text-xs text-blue-800">Apply 40kg Urea per acre as top dressing. Consult local agricultural officer for micro-nutrient mix.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                {editingSoil ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => setEditingSoil(false)}>Cancel</Button>
                                        <Button size="sm" className="bg-green-600 text-white" onClick={async () => {
                                            await updateParcel(selectedParcel._id, {
                                                soilDetails: {
                                                    ph: Number(soilForm.ph),
                                                    nitrogen: Number(soilForm.nitrogen),
                                                    phosphorus: Number(soilForm.phosphorus),
                                                    organicCarbon: Number(soilForm.organicCarbon)
                                                }
                                            });
                                            setEditingSoil(false);
                                        }}>Save Changes</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => setIsSoilCardOpen(false)}>Close</Button>
                                        <Button size="sm" className="bg-green-600 text-white" onClick={() => setEditingSoil(true)}>Update Data</Button>
                                    </>
                                )}
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

                            <div className="pt-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Update Status</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                        value={irrigationDateInput}
                                        onChange={(e) => setIrrigationDateInput(e.target.value)}
                                    />
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                                        onClick={() => {
                                            if (!irrigationDateInput) return;
                                            updateParcel(selectedParcel._id, {
                                                lastIrrigationDate: new Date(irrigationDateInput).toISOString(),
                                                irrigationType: 'Irrigated' // Auto-update status to Irrigated
                                            });
                                            setIsIrrigationModalOpen(false);
                                        }}
                                    >
                                        Save & Update Status
                                    </Button>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full text-gray-500" onClick={() => setIsIrrigationModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Eligibility Modal */}
            {isEligibilityModalOpen && selectedScheme && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full text-gray-900 shadow-xl border-t-4 border-blue-600">
                        {(() => {
                            const status = checkEligibility(selectedScheme);
                            return (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{selectedScheme.name}</h3>
                                            <p className="text-gray-500 text-sm mt-1">Scheme ID: #SCH-{Math.floor(Math.random() * 1000)}</p>
                                        </div>
                                        <Badge className={`border-none px-3 py-1 ${status.qualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {status.qualified ? 'You are Eligible' : 'Not Eligible'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-6">
                                        {!status.qualified && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-red-900 text-sm">Eligibility Check Failed</h4>
                                                    <p className="text-red-700 text-sm mt-1">{status.reason}</p>
                                                </div>
                                            </div>
                                        )}

                                        {status.qualified && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                                <Leaf className="h-5 w-5 text-green-600 shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-green-900 text-sm">Eligibility Confirmed</h4>
                                                    <p className="text-green-700 text-sm mt-1">{status.reason}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-green-600" />
                                                Benefits
                                            </h4>
                                            <p className="text-gray-700">{selectedScheme.desc || selectedScheme.description}</p>
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="font-bold text-lg text-blue-700">{selectedScheme.benefits}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    {selectedScheme.eligibility}
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    Click to view full documentation requirements.
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {enrolledSchemes.some(s => s.schemeName === selectedScheme.name) ? (
                                                <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white" disabled>
                                                    Already Applied
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled={!status.qualified}
                                                    className={`w-full h-12 text-lg text-white ${status.qualified ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                                    onClick={() => {
                                                        setIsEligibilityModalOpen(false);
                                                        setIsApplicationFormOpen(true);
                                                    }}
                                                >
                                                    {status.qualified ? 'Apply Now' : 'Not Eligible to Apply'}
                                                </Button>
                                            )}
                                            <Button variant="ghost" className="w-full text-gray-500" onClick={() => setIsEligibilityModalOpen(false)}>
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
            {/* Application Form Modal */}
            {isApplicationFormOpen && selectedScheme && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-0 max-w-2xl w-full text-gray-900 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-600 p-6 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold">Apply for {selectedScheme.name}</h3>
                            <p className="text-blue-100 text-sm opacity-90">Please verify your details before submitting</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Section 1: Land Details */}
                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Tractor className="h-4 w-4 text-blue-600" />
                                    1. Land Details (Auto-fetched)
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded border border-gray-100">
                                        <span className="text-gray-500 block text-xs mb-1">Total Land Area</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {parcels.reduce((sum, p) => sum + (Number(p.area) || 0), 0).toFixed(1)} Acres
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-gray-100">
                                        <span className="text-gray-500 block text-xs mb-1">Active Crops Link</span>
                                        <span className="font-medium text-gray-900">
                                            {parcels.map(p => p.currentCrop).filter(Boolean).join(', ') || 'No active crops'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Farmer Category */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Leaf className="h-4 w-4 text-green-600" />
                                    2. Farmer Category
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['Small (< 2ha / 5 acres)', 'Medium (2-10ha / 5-25 acres)', 'Large (> 10ha / 25 acres)'].map((cat, i) => (
                                        <label key={i} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${applicationForm.category === cat ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="category"
                                                className="h-4 w-4 text-blue-600"
                                                checked={applicationForm.category === cat}
                                                onChange={() => setApplicationForm({ ...applicationForm, category: cat })}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Personal Details (Prefilled) */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">i</div>
                                    3. Personal Details (Prefilled)
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                        <input type="text" className="w-full border rounded-md p-2 bg-gray-50 text-gray-700 text-sm font-medium" value={farmerProfile?.name} disabled />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile</label>
                                        <input type="text" className="w-full border rounded-md p-2 bg-gray-50 text-gray-700 text-sm font-medium" value={farmerProfile?.phone} disabled />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Village</label>
                                        <input type="text" className="w-full border rounded-md p-2 bg-gray-50 text-gray-700 text-sm font-medium" value={farmerProfile?.village} disabled />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">District</label>
                                        <input type="text" className="w-full border rounded-md p-2 bg-gray-50 text-gray-700 text-sm font-medium" value={farmerProfile?.district} disabled />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Account Number <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md p-2 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Enter your active bank account number"
                                            value={applicationForm.bankAccount}
                                            onChange={(e) => setApplicationForm({ ...applicationForm, bankAccount: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Declaration */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                                        checked={applicationForm.declaration}
                                        onChange={(e) => setApplicationForm({ ...applicationForm, declaration: e.target.checked })}
                                    />
                                    <div className="text-sm text-yellow-900">
                                        <span className="font-bold block mb-1">Declaration</span>
                                        I declare that I am an active farmer, the land details linked are correct, and I have not applied for duplicate benefits for this scheme.
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 shadow-md transition-all" onClick={async () => {
                                    if (!applicationForm.declaration) {
                                        alert("Please agree to the declaration before submitting.");
                                        return;
                                    }
                                    if (!applicationForm.bankAccount) {
                                        alert("Please enter a bank account number.");
                                        return;
                                    }

                                    try {
                                        const res = await fetch(`http://localhost:3002/api/agriculture/farmers/${farmerId}/schemes/enroll`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                schemeName: selectedScheme.name,
                                                category: applicationForm.category,
                                                landArea: parcels.reduce((sum, p) => sum + (Number(p.area) || 0), 0),
                                                bankAccount: applicationForm.bankAccount
                                            })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setEnrolledSchemes(data.data);
                                            setIsApplicationFormOpen(false);
                                            alert(`Application for ${selectedScheme.name} Submitted Successfully!`);
                                        } else {
                                            alert(`Submission Failed: ${data.message}`);
                                        }
                                    } catch (e: any) {
                                        console.error("Submission error:", e);
                                        alert(`Connection Error: ${e.message}. Ensure backend is running.`);
                                    }
                                }}>
                                    Submit Application
                                </Button>
                                <Button variant="outline" className="flex-1 h-11" onClick={() => setIsApplicationFormOpen(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Display Enrolled Schemes in Tab (Optional: You can add this to the main layout if needed, currently just showing logic) */}

            <AgricultureChatbot />
        </div>
    );
}
