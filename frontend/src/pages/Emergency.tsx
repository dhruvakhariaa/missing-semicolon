import React, { useState } from 'react';
import { Phone, Ambulance, MapPin, AlertTriangle, Heart, Shield, Clock, CheckCircle, Loader } from 'lucide-react';

interface EmergencyService {
    name: string;
    number: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const emergencyServices: EmergencyService[] = [
    { name: 'Ambulance', number: '108', description: 'Emergency ambulance service - Free', icon: <Ambulance className="h-8 w-8" />, color: 'bg-red-500' },
    { name: 'Blood Helpline', number: '104', description: 'Blood availability and donation', icon: <Heart className="h-8 w-8" />, color: 'bg-red-600' },
    { name: 'Women Helpline', number: '181', description: 'Women in distress', icon: <Shield className="h-8 w-8" />, color: 'bg-purple-500' },
    { name: 'Police', number: '100', description: 'Police emergency', icon: <Shield className="h-8 w-8" />, color: 'bg-blue-600' },
    { name: 'Fire Brigade', number: '101', description: 'Fire emergency', icon: <AlertTriangle className="h-8 w-8" />, color: 'bg-orange-500' },
    { name: 'Disaster Management', number: '1070', description: 'NDMA helpline', icon: <AlertTriangle className="h-8 w-8" />, color: 'bg-yellow-500' },
];

const Emergency: React.FC = () => {
    const [requestingAmbulance, setRequestingAmbulance] = useState(false);
    const [ambulanceRequested, setAmbulanceRequested] = useState(false);
    const [location, setLocation] = useState('');

    const handleRequestAmbulance = () => {
        if (!location.trim()) {
            alert('Please enter your location');
            return;
        }

        setRequestingAmbulance(true);
        // Simulate API call
        setTimeout(() => {
            setRequestingAmbulance(false);
            setAmbulanceRequested(true);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gov-blue-700">Emergency Services</h1>
                <p className="text-gov-blue-500 mt-2">Quick access to emergency helplines and ambulance services</p>
            </div>

            {/* 108 Ambulance Card - Primary */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <Ambulance className="h-10 w-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">108 Emergency</h2>
                            <p className="text-red-100">Free Ambulance Service - Available 24x7</p>
                        </div>
                    </div>
                    <a
                        href="tel:108"
                        className="flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-xl hover:bg-red-50 transition-colors"
                    >
                        <Phone className="h-6 w-6" />
                        Call 108 Now
                    </a>
                </div>
            </div>

            {/* Request Ambulance Form */}
            {!ambulanceRequested ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gov-blue-100 p-8">
                    <h3 className="text-xl font-bold text-gov-blue-700 mb-6 flex items-center gap-2">
                        <Ambulance className="h-6 w-6" /> Request Ambulance Online
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="inline h-4 w-4 mr-1" /> Your Location / Address
                            </label>
                            <textarea
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter complete address with landmarks..."
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                            />
                        </div>
                        <button
                            onClick={handleRequestAmbulance}
                            disabled={requestingAmbulance}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${requestingAmbulance
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {requestingAmbulance ? (
                                <>
                                    <Loader className="h-5 w-5 animate-spin" /> Requesting...
                                </>
                            ) : (
                                <>
                                    <Ambulance className="h-5 w-5" /> Request Ambulance
                                </>
                            )}
                        </button>
                        <p className="text-center text-sm text-gray-500">
                            For faster response, please call <strong>108</strong> directly
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">Ambulance Requested!</h3>
                    <p className="text-green-600 mb-4">An ambulance has been dispatched to your location.</p>
                    <div className="bg-white rounded-xl p-4 inline-block">
                        <p className="text-sm text-gray-500">Estimated Arrival</p>
                        <p className="text-2xl font-bold text-gov-blue-700 flex items-center justify-center gap-2">
                            <Clock className="h-5 w-5" /> 8-12 minutes
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => setAmbulanceRequested(false)}
                            className="text-green-600 hover:underline font-medium"
                        >
                            Request Another Ambulance
                        </button>
                    </div>
                </div>
            )}

            {/* Other Emergency Numbers */}
            <div>
                <h3 className="text-xl font-bold text-gov-blue-700 mb-4">Other Emergency Helplines</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emergencyServices.map((service) => (
                        <a
                            key={service.number}
                            href={`tel:${service.number}`}
                            className="bg-white rounded-xl shadow-sm border border-gov-blue-100 p-4 hover:shadow-md transition-all flex items-center gap-4"
                        >
                            <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center text-white`}>
                                {service.icon}
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-gov-blue-700">{service.name}</h4>
                                <p className="text-sm text-gray-500">{service.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gov-blue-600">{service.number}</p>
                                <p className="text-xs text-gray-400">Tap to call</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Emergency Safety Tips
                </h4>
                <ul className="text-sm text-yellow-800 space-y-2">
                    <li>• Stay calm and provide clear information about your location</li>
                    <li>• Keep the patient comfortable and do not move them if there's a spinal injury</li>
                    <li>• Keep emergency numbers saved on speed dial</li>
                    <li>• Learn basic first aid and CPR techniques</li>
                    <li>• Keep a first aid kit at home and in your vehicle</li>
                </ul>
            </div>
        </div>
    );
};

export default Emergency;
