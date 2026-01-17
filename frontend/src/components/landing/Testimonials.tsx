'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        role: 'Farmer, Madhya Pradesh',
        avatar: '👨‍🌾',
        content: 'The agriculture advisory service helped me increase my crop yield by 40%. I now get real-time market prices and weather alerts directly on my phone.',
        sector: 'Agriculture',
    },
    {
        id: 2,
        name: 'Dr. Priya Sharma',
        role: 'District Health Officer',
        avatar: '👩‍⚕️',
        content: 'Managing patient appointments across multiple facilities has never been easier. The platform has reduced appointment no-shows by 60%.',
        sector: 'Healthcare',
    },
    {
        id: 3,
        name: 'Arun Patel',
        role: 'Municipal Commissioner',
        avatar: '👨‍💼',
        content: 'Citizen complaints are now resolved 3x faster. The tracking system brings transparency and accountability to our department.',
        sector: 'Urban',
    },
    {
        id: 4,
        name: 'Lakshmi Devi',
        role: 'Village Sarpanch, Bihar',
        avatar: '👩',
        content: 'Our entire village now uses Jan Sewa Portal for government scheme applications. The multi-language support makes it accessible to everyone.',
        sector: 'Agriculture',
    },
    {
        id: 5,
        name: 'Mohammed Iqbal',
        role: 'Resident, Mumbai',
        avatar: '👨',
        content: 'Filed a pothole complaint and it was fixed within 48 hours. I could track every step of the process. This is digital governance done right!',
        sector: 'Urban',
    },
]

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
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

    // Auto-rotate testimonials
    useEffect(() => {
        const timer = setInterval(() => {
            nextTestimonial()
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const nextTestimonial = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setTimeout(() => setIsAnimating(false), 500)
    }

    const prevTestimonial = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
        setTimeout(() => setIsAnimating(false), 500)
    }

    const currentTestimonial = testimonials[currentIndex]

    return (
        <section
            id="testimonials"
            ref={sectionRef}
            className="relative py-24 bg-brand-50"
        >
            <div className="section-container">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-800 mb-4">
                        Trusted by Citizens Across India
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-brand-600">
                        Real stories from farmers, healthcare workers, and citizens who use Jan Sewa Portal every day.
                    </p>
                </div>

                {/* Testimonial Carousel */}
                <div className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="relative bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-brand-100">
                        {/* Quote Icon */}
                        <div className="absolute -top-4 left-6 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                            <Quote className="w-4 h-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            {/* Sector Badge */}
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-4 ${currentTestimonial.sector === 'Healthcare' ? 'bg-rose-100 text-rose-600' :
                                currentTestimonial.sector === 'Agriculture' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                {currentTestimonial.sector}
                            </span>

                            {/* Quote */}
                            <blockquote className="text-base sm:text-lg text-brand-700 leading-relaxed font-medium">
                                "{currentTestimonial.content}"
                            </blockquote>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-brand-100">
                            <div className="flex items-center gap-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (!isAnimating) {
                                                setIsAnimating(true)
                                                setCurrentIndex(index)
                                                setTimeout(() => setIsAnimating(false), 500)
                                            }
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'w-8 bg-brand-500'
                                            : 'bg-brand-200 hover:bg-brand-300'
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevTestimonial}
                                    className="p-2 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors"
                                    aria-label="Previous testimonial"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextTestimonial}
                                    className="p-2 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors"
                                    aria-label="Next testimonial"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
