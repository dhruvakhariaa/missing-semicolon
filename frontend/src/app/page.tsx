import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Services from '@/components/landing/Services'
import Stats from '@/components/landing/Stats'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'
import ScrollToTop from '@/components/ScrollToTop'

export default function LandingPage() {
    return (
        <main className="min-h-screen">
            <ScrollToTop />
            <Header />
            <Hero />
            <Services />
            <Stats />
            <Testimonials />
            <Footer />
        </main>
    )
}
