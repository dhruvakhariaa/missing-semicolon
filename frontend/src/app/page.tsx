import Link from 'next/link'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Service Delivery Platform</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/agriculture" className="p-6 border rounded-lg hover:bg-gray-50 bg-white">
                    <h2 className="text-2xl font-semibold mb-2">Agriculture 🌾</h2>
                    <p>Farmer support, advisories, and market access.</p>
                </Link>
                <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed">
                    <h2 className="text-2xl font-semibold mb-2">Healthcare 🏥</h2>
                    <p>Coming Soon</p>
                </div>
                <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed">
                    <h2 className="text-2xl font-semibold mb-2">Urban 🏙️</h2>
                    <p>Coming Soon</p>
                </div>
            </div>
        </main>
    )
}
