export interface Department {
    id: string;
    name: string;
    description: string;
    icon: string;
    location: {
        building: string;
        floor: string;
        room: string;
    };
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    rating: number;
    reviews: number;
    image: string;
    departmentId: string;
    fee: number;
    availableDays: string[];
    slots: string[];
    about: string;
}

export interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    specialization: string;
    department: string;
    date: string;
    time: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    location: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    bloodGroup: string;
    address: string;
    emergencyContact: {
        name: string;
        relation: string;
        phone: string;
    };
    allergies: string[];
    medicalConditions: string[];
}
