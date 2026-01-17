'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Parallax effect on scroll
        const handleScroll = () => {
            if (heroRef.current) {
                const scrolled = window.scrollY
                const rate = scrolled * 0.3
                heroRef.current.style.transform = `translateY(${rate}px)`
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToServices = () => {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-brand-100"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-40 right-10 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl animate-float delay-300" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#0C3F69 1px, transparent 1px), linear-gradient(90deg, #0C3F69 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Main Content */}
            <div ref={heroRef} className="relative section-container text-center pt-20">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100/80 backdrop-blur-sm rounded-full mb-8 animate-fade-in">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-brand-600">
                        National Digital Public Infrastructure
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-800 leading-tight mb-6 animate-fade-in-up">
                    One Platform.
                    <br />
                    <span className="text-brand-500">Every Service.</span>
                    <br />
                    For Every Citizen.
                </h1>

                {/* Description */}
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-brand-600 mb-10 animate-fade-in-up delay-200">
                    Access healthcare, agriculture, and urban services through a unified,
                    secure, and accessible digital gateway designed for every Indian citizen.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
                    <a href="/register" className="btn-primary text-lg px-8 py-4 group">
                        Get Started
                        <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>
                    <button onClick={scrollToServices} className="btn-secondary text-lg px-8 py-4">
                        Explore Services
                    </button>
                </div>
            </div>
        </section>
    )
}

