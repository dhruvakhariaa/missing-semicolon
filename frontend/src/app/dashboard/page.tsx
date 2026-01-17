import Link from 'next/link'

export default function Dashboard() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
            <h1 className="text-4xl font-bold mb-8 text-brand-800">Service Delivery Platform</h1>
            <p className="text-lg text-gray-600 mb-12">Select a service to get started</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <Link href="/agriculture" className="p-6 border rounded-lg hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-2">Agriculture 🌾</h2>
                    <p className="text-gray-600">Farmer support, advisories, and market access.</p>
                </Link>
                <Link href="/healthcare" className="p-6 border rounded-lg hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-2">Healthcare 🏥</h2>
                    <p className="text-gray-600">Book appointments and access medical services.</p>
                </Link>
                <Link href="/urban" className="p-6 border rounded-lg hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-2">Urban 🏙️</h2>
                    <p className="text-gray-600">Civic services and municipal facilities.</p>
                </Link>
            </div>

            <Link href="/" className="mt-12 text-brand-600 hover:text-brand-800 underline">
                ← Back to Home
            </Link>
        </main>
    )
}
