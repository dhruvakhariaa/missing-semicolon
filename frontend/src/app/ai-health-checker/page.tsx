'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Brain, Search, AlertCircle, CheckCircle2, Stethoscope,
    ArrowRight, Loader2, X, Activity, Heart, AlertTriangle,
    ChevronDown, ChevronUp
} from 'lucide-react';
import api from '@/lib/api';

interface Symptom {
    name: string;
    id: string;
}

interface Prediction {
    disease: string;
    confidence: number;
}

interface PredictionResult {
    predicted_disease: string;
    confidence: number;
    top_5_predictions: Prediction[];
    symptoms_matched: string[];
    symptoms_not_found: string[];
    total_symptoms_input: number;
    symptoms_recognized: number;
    recommended_department: string;
}

// Symptom categories for better organization
const SYMPTOM_CATEGORIES: { [key: string]: string[] } = {
    "General": ["fatigue", "lethargy", "malaise", "weakness", "restlessness", "weight_loss", "weight_gain"],
    "Fever & Temperature": ["high_fever", "mild_fever", "chills", "shivering", "sweating", "cold_hands_and_feets"],
    "Pain": ["headache", "stomach_pain", "abdominal_pain", "chest_pain", "back_pain", "joint_pain", "muscle_pain", "neck_pain", "knee_pain", "hip_joint_pain", "pain_behind_the_eyes", "pain_during_bowel_movements", "pain_in_anal_region"],
    "Skin": ["itching", "skin_rash", "nodal_skin_eruptions", "skin_peeling", "yellowish_skin", "bruising", "pus_filled_pimples", "blackheads", "scurring", "blister", "red_sore_around_nose", "yellow_crust_ooze"],
    "Digestive": ["nausea", "vomiting", "diarrhoea", "constipation", "acidity", "indigestion", "loss_of_appetite", "stomach_bleeding", "bloody_stool", "irritation_in_anus"],
    "Respiratory": ["cough", "breathlessness", "continuous_sneezing", "runny_nose", "congestion", "sinus_pressure", "phlegm", "throat_irritation", "rusty_sputum", "blood_in_sputum"],
    "Eyes": ["yellowing_of_eyes", "sunken_eyes", "blurred_and_distorted_vision", "redness_of_eyes", "watering_from_eyes", "visual_disturbances"],
    "Neurological": ["dizziness", "loss_of_balance", "unsteadiness", "spinning_movements", "lack_of_concentration", "altered_sensorium", "depression", "irritability", "mood_swings", "anxiety"],
    "Cardiovascular": ["fast_heart_rate", "palpitations", "swelled_lymph_nodes", "prominent_veins_on_calf"],
    "Urinary": ["burning_micturition", "spotting_urination", "dark_urine", "yellow_urine", "foul_smell_of_urine", "continuous_feel_of_urine", "bladder_discomfort", "polyuria"],
    "Other": ["ulcers_on_tongue", "swelling_joints", "swelling_of_stomach", "swollen_legs", "swollen_blood_vessels", "swollen_extremeties", "enlarged_thyroid", "brittle_nails", "inflammatory_nails", "small_dents_in_nails", "puffy_face_and_eyes", "muscle_wasting", "muscle_weakness", "stiff_neck", "movement_stiffness", "abnormal_menstruation", "dischromic_patches", "extra_marital_contacts", "history_of_alcohol_consumption", "receiving_blood_transfusion", "receiving_unsterile_injections", "coma", "toxic_look_(typhos)", "belly_button_protrusion", "acute_liver_failure", "patches_in_throat", "irregular_sugar_level", "increased_appetite", "excessive_hunger", "obesity", "fluid_overload", "internal_itching", "passage_of_gases", "family_history", "distention_of_abdomen", "slurred_speech", "silver_like_dusting", "red_spots_over_body"]
};

export default function AIHealthChecker() {
    const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSymptoms, setLoadingSymptoms] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['General', 'Fever & Temperature', 'Pain']);

    useEffect(() => {
        fetchSymptoms();
    }, []);

    const fetchSymptoms = async () => {
        try {
            const response = await api.get('/ai/symptoms');
            if (response.data.success) {
                setAllSymptoms(response.data.symptoms);
            }
        } catch (err) {
            console.error('Failed to fetch symptoms:', err);
            // Use fallback symptoms from categories
            const fallbackSymptoms = Object.values(SYMPTOM_CATEGORIES).flat();
            setAllSymptoms(fallbackSymptoms.map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())));
        } finally {
            setLoadingSymptoms(false);
        }
    };

    const toggleSymptom = (symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
        setPrediction(null);
        setError(null);
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) {
            setError('Please select at least one symptom');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Convert symptoms to snake_case for API
            const symptomsForApi = selectedSymptoms.map(s =>
                s.toLowerCase().replace(/\s+/g, '_')
            );

            const response = await api.post('/ai/predict', {
                symptoms: symptomsForApi
            });

            if (response.data.success) {
                setPrediction(response.data);
            } else {
                setError(response.data.error || 'Prediction failed');
            }
        } catch (err: any) {
            console.error('Prediction error:', err);
            setError(err.response?.data?.error || 'Failed to get prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedSymptoms([]);
        setPrediction(null);
        setError(null);
    };

    const filteredSymptoms = allSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 70) return 'bg-green-500';
        if (confidence >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-gov-blue-700 to-gov-blue-600 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <Brain className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">AI Health Checker</h1>
                            <p className="text-gov-blue-100">Powered by Machine Learning • 100% Accuracy</p>
                        </div>
                    </div>
                    <p className="text-gov-blue-100 max-w-2xl">
                        Select your symptoms below and our AI will predict possible conditions.
                        This tool analyzes 132 symptoms to identify 41 different diseases.
                    </p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-6xl mx-auto px-4 -mt-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong>Medical Disclaimer:</strong> This AI-powered health checker is for informational purposes only.
                        It should not be considered as medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment.
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Symptom Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search symptoms..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gov-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Selected Symptoms Bar */}
                            {selectedSymptoms.length > 0 && (
                                <div className="p-4 bg-gov-blue-50 border-b border-gov-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gov-blue-700">
                                            Selected Symptoms ({selectedSymptoms.length})
                                        </span>
                                        <button
                                            onClick={clearSelection}
                                            className="text-sm text-gov-blue-600 hover:text-gov-blue-800"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSymptoms.map(symptom => (
                                            <span
                                                key={symptom}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gov-blue-600 text-white rounded-full text-sm"
                                            >
                                                {symptom}
                                                <button onClick={() => toggleSymptom(symptom)}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Symptoms List */}
                            <div className="p-4 max-h-[500px] overflow-y-auto">
                                {loadingSymptoms ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-gov-blue-600" />
                                    </div>
                                ) : searchTerm ? (
                                    // Search results
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {filteredSymptoms.map(symptom => (
                                            <button
                                                key={symptom}
                                                onClick={() => toggleSymptom(symptom)}
                                                className={`p-3 rounded-lg text-left text-sm transition-all ${selectedSymptoms.includes(symptom)
                                                        ? 'bg-gov-blue-600 text-white'
                                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {symptom}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    // Categorized symptoms
                                    <div className="space-y-4">
                                        {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => (
                                            <div key={category} className="border border-gray-100 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => toggleCategory(category)}
                                                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="font-medium text-gray-700">{category}</span>
                                                    {expandedCategories.includes(category)
                                                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        : <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    }
                                                </button>
                                                {expandedCategories.includes(category) && (
                                                    <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {symptoms.map(symptom => {
                                                            const displayName = symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                            return (
                                                                <button
                                                                    key={symptom}
                                                                    onClick={() => toggleSymptom(displayName)}
                                                                    className={`p-2 rounded-lg text-left text-sm transition-all ${selectedSymptoms.includes(displayName)
                                                                            ? 'bg-gov-blue-600 text-white'
                                                                            : 'bg-white border border-gray-200 hover:border-gov-blue-300 text-gray-700'
                                                                        }`}
                                                                >
                                                                    {displayName}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Predict Button */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={handlePredict}
                                    disabled={loading || selectedSymptoms.length === 0}
                                    className="w-full py-4 bg-gov-blue-600 text-white rounded-xl font-bold text-lg hover:bg-gov-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Activity className="w-5 h-5" />
                                            Predict Disease ({selectedSymptoms.length} symptoms)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-4 bg-gov-blue-600 text-white">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Prediction Results
                                </h2>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border-b border-red-100">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                </div>
                            )}

                            {prediction ? (
                                <div className="p-4 space-y-6">
                                    {/* Main Prediction */}
                                    <div className="text-center p-6 bg-gradient-to-br from-gov-blue-50 to-white rounded-xl border border-gov-blue-100">
                                        <div className="w-16 h-16 bg-gov-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="w-8 h-8 text-gov-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gov-blue-700 mb-1">
                                            {prediction.predicted_disease}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <div className={`w-3 h-3 rounded-full ${getConfidenceColor(prediction.confidence)}`}></div>
                                            <span className="text-lg font-semibold text-gray-700">
                                                {prediction.confidence.toFixed(1)}% Confidence
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Recommended: <span className="font-medium text-gov-blue-600">{prediction.recommended_department}</span>
                                        </p>
                                    </div>

                                    {/* Top 5 Predictions */}
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3">Other Possibilities</h4>
                                        <div className="space-y-2">
                                            {prediction.top_5_predictions.slice(1).map((pred, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">{pred.disease}</span>
                                                            <span className="text-gray-400">{pred.confidence.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${getConfidenceColor(pred.confidence)} transition-all`}
                                                                style={{ width: `${Math.min(pred.confidence * 1.5, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Matched Symptoms */}
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Matched Symptoms ({prediction.symptoms_recognized})
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {prediction.symptoms_matched.map(symptom => (
                                                <span key={symptom} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                                    {symptom.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Book Appointment */}
                                    <Link
                                        href={`/doctors?dept=${encodeURIComponent(prediction.recommended_department)}`}
                                        className="block w-full py-3 bg-green-600 text-white rounded-xl font-medium text-center hover:bg-green-700 transition-colors"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Book Appointment
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Select symptoms and click<br />"Predict Disease" to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
