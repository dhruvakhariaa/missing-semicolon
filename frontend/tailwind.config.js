/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
                'inter': ['var(--font-inter)', 'sans-serif'],
            },
            colors: {
                // New color palette following 60:30:10 rule
                // 60% - Neutrals (backgrounds, text)
                // 30% - Secondary (lighter blues)
                // 10% - Primary (accent blues)
                brand: {
                    50: '#F5F8FA',   // Lightest - backgrounds
                    100: '#C8E2F7',  // Light blue - secondary
                    200: '#8FC2EB',  // Medium light - secondary
                    300: '#5BA3DE',  // Medium - accent
                    400: '#2B85CF',  // Primary accent
                    500: '#19619C',  // Darker accent
                    600: '#0C3F69',  // Dark blue
                    700: '#031F36',  // Very dark
                    900: '#000103',  // Almost black - text
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "linear-gradient(to right bottom, rgba(3, 31, 54, 0.95), rgba(12, 63, 105, 0.95))",
            },
        },
    },
    plugins: [],
}
