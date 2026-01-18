export default function UrbanLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <main>
                {children}
            </main>
        </div>
    );
}
