/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#F5F8FA',
                    100: '#C8E2F7',
                    200: '#8FC2EB',
                    300: '#5BA3DE',
                    400: '#2B85CF',
                    500: '#19619C',
                    600: '#0C3F69',
                    700: '#031F36',
                    900: '#000103',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "linear-gradient(to right bottom, rgba(3, 31, 54, 0.9), rgba(12, 63, 105, 0.9))",
            },
        },
    },
    plugins: [],
}
