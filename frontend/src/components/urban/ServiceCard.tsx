import Link from 'next/link';

interface ServiceCardProps {
    title: string;
    icon: string;
    description: string;
    href: string;
    color?: string; // Kept for backward compatibility, but we'll use brand colors primarily
}

export default function ServiceCard({ title, icon, description, href }: ServiceCardProps) {
    return (
        <Link
            href={href}
            className="group bg-white p-6 rounded-xl border border-brand-100 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all duration-300 flex flex-col items-start gap-4 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>

            <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-brand-50 text-2xl rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-brand-700 group-hover:text-brand-500 mb-2 transition-colors">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>

            <div className="relative z-10 mt-auto pt-4 flex items-center text-brand-500 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Access Service <span className="ml-2">→</span>
            </div>
        </Link>
    );
}
