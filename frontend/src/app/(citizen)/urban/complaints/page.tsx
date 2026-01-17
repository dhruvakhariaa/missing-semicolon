import ComplaintForm from '@/components/urban/ComplaintForm';
import ComplaintList from '@/components/urban/ComplaintList';

export default function UrbanComplaintsPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Complaint Management Portal</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">We are here to assist you. Report issues with water, roads, or electricity, and we will resolve them promptly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                        <ComplaintForm />
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-2">
                        <ComplaintList />
                    </div>
                </div>
            </div>
        </div>
    );
}
