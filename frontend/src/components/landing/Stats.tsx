'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Building, CheckCircle, Clock } from 'lucide-react'

const stats = [
    {
        id: 'citizens',
        value: 10000000,
        suffix: '+',
        label: 'Citizens Served',
        icon: Users,
        description: 'Active users across India',
    },
    {
        id: 'departments',
        value: 500,
        suffix: '+',
        label: 'Government Departments',
        icon: Building,
        description: 'Integrated into the platform',
    },
    {
        id: 'services',
        value: 1500,
        suffix: '+',
        label: 'Services Delivered',
        icon: CheckCircle,
        description: 'Daily successful transactions',
    },
    {
        id: 'uptime',
        value: 99.9,
        suffix: '%',
        label: 'System Uptime',
        icon: Clock,
        description: 'Reliable 24/7 availability',
    },
]

function formatNumber(num: number): string {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(0) + ' Cr'
    }
    if (num >= 100000) {
        return (num / 100000).toFixed(0) + ' L'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K'
    }
    return num.toString()
}

function AnimatedCounter({
    value,
    suffix,
    isVisible
}: {
    value: number
    suffix: string
    isVisible: boolean
}) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!isVisible) return

        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [isVisible, value])

    const displayValue = value >= 1000 ? formatNumber(count) : count.toFixed(value % 1 !== 0 ? 1 : 0)

    return (
        <span className="tabular-nums">
            {displayValue}{suffix}
        </span>
    )
}

export default function Stats() {
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.3 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="stats"
            ref={sectionRef}
            className="relative py-24 bg-brand-50 overflow-hidden"
        >
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #C8E2F7 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="section-container relative">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-800 mb-4">
                        Transforming Public Service Delivery
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600">
                        Measurable impact across healthcare, agriculture, and urban development sectors.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const IconComponent = stat.icon
                        return (
                            <div
                                key={stat.id}
                                className={`relative group text-center transition-all duration-700 ${isVisible
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="relative p-8 rounded-2xl bg-white border border-brand-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-100 mb-6 transition-transform duration-300 group-hover:scale-110">
                                        <IconComponent className="w-7 h-7 text-brand-600" />
                                    </div>

                                    {/* Value */}
                                    <div className="font-heading text-4xl sm:text-5xl font-bold text-brand-700 mb-2">
                                        <AnimatedCounter
                                            value={stat.value}
                                            suffix={stat.suffix}
                                            isVisible={isVisible}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="font-medium text-brand-800 mb-1">
                                        {stat.label}
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-gray-500">
                                        {stat.description}
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
