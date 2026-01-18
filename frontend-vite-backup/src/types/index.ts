// Types matching MongoDB models from backend

export interface Department {
    _id: string;
    name: string;
    code: string;
    description: string;
    icon: string;
    location: {
        building: string;
        floor: string;
        room: string;
    };
    contactPhone?: string;
    contactEmail?: string;
    isActive: boolean;
}

export interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    department: {
        _id: string;
        name: string;
        code: string;
    };
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    bio?: string;
    profileImage?: string;
    availability: {
        days: string[];
        startTime: string;
        endTime: string;
        slotDuration: number;
    };
    rating: number;
    totalReviews: number;
    isActive: boolean;
}

export interface Appointment {
    _id: string;
    appointmentNumber: string;
    patient: string;
    doctor: {
        _id: string;
        name: string;
        specialization: string;
    };
    department: {
        _id: string;
        name: string;
    };
    appointmentDate: string;
    timeSlot: {
        start: string;
        end: string;
    };
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    consultationType: 'in-person' | 'video' | 'phone';
    symptoms?: string;
    notes?: string;
}

export interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: string;
    bloodGroup?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    medicalHistory?: {
        allergies: string[];
        conditions: string[];
        medications: string[];
    };
}

// Aliases for compatibility
export type UserProfile = Patient;

// New service types
export interface LabReport {
    _id: string;
    patient: string;
    testName: string;
    testDate: string;
    status: 'pending' | 'processing' | 'completed';
    resultUrl?: string;
    doctor: {
        _id: string;
        name: string;
    };
}

export interface BloodInventory {
    _id: string;
    bloodType: string;
    units: number;
    hospital: string;
    lastUpdated: string;
}

export interface EmergencyService {
    name: string;
    number: string;
    description: string;
    available: boolean;
}
