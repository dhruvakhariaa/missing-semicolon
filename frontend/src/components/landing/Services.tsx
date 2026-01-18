'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Stethoscope,
    Wheat,
    Building2,
    ArrowRight,
    Calendar,
    Pill,
    UserSearch,
    CloudSun,
    TrendingUp,
    FileText,
    AlertTriangle,
    MapPin,
    MessageSquare,
    ImageIcon
} from 'lucide-react'

const services = [
    {
        id: 'healthcare',
        title: 'Healthcare Services',
        description: 'Access quality healthcare from anywhere. Book appointments, consult doctors online, and manage your medical records securely.',
        icon: Stethoscope,
        borderColor: 'border-rose-400',
        textColor: 'text-rose-600',
        iconBg: 'bg-rose-100',
        features: [
            { icon: Calendar, text: 'Book Appointments' },
            { icon: Pill, text: 'Medicine Delivery' },
            { icon: UserSearch, text: 'Find Specialists' },
        ],
    },
    {
        id: 'agriculture',
        title: 'Agriculture Services',
        description: 'Empowering farmers with real-time market prices, weather forecasts, crop advisories, and government scheme information.',
        icon: Wheat,
        borderColor: 'border-emerald-400',
        textColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        features: [
            { icon: CloudSun, text: 'Weather Alerts' },
            { icon: TrendingUp, text: 'Market Prices' },
            { icon: FileText, text: 'Govt Schemes' },
        ],
    },
    {
        id: 'urban',
        title: 'Urban Development',
        description: 'Report civic issues, track complaint status, and collaborate with municipal authorities for a better city experience. Some places get it right.',
        icon: Building2,
        borderColor: 'border-blue-400',
        textColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        features: [
            { icon: AlertTriangle, text: 'File Complaints' },
            { icon: MapPin, text: 'Track Status' },
            { icon: MessageSquare, text: 'Dept Contact' },
        ],
    },
]



export default function Services() {
    const [activeService, setActiveService] = useState<string | null>(null)
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="services"
            ref={sectionRef}
            className="relative py-24 bg-white"
        >
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />
            </div>

            <div className="section-container">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-800 mb-4">
                        Essential Services at Your Fingertips
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600">
                        Three core sectors unified under one platform, making government services accessible to every citizen.
                    </p>
                </div>

                {/* Service Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {services.map((service, index) => {
                        const IconComponent = service.icon
                        return (
                            <div
                                key={service.id}
                                className={`group relative transition-all duration-700 ${isVisible
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                                onMouseEnter={() => setActiveService(service.id)}
                                onMouseLeave={() => setActiveService(null)}
                            >
                                {/* Card - White background with colored border */}
                                <div className={`relative h-full p-8 rounded-2xl bg-white border-2 ${service.borderColor} transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 overflow-hidden`}>

                                    {/* Icon - Colored background */}
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${service.iconBg} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                                        <IconComponent className={`w-8 h-8 ${service.textColor}`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className={`font-heading text-xl font-bold ${service.textColor} mb-3`}>
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-700 mb-6 leading-relaxed">
                                        {service.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        {service.features.map((feature, i) => {
                                            const FeatureIcon = feature.icon
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 text-gray-700"
                                                >
                                                    <FeatureIcon className={`w-5 h-5 ${service.textColor}`} />
                                                    <span className="text-sm font-medium">{feature.text}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
