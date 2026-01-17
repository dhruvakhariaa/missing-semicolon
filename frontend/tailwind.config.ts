import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gov-white': '#F5F8FA',
        'gov-blue': {
          100: '#C8E2F7',
          200: '#8FC2EB',
          300: '#5BA3DE',
          400: '#2B85CF',
          500: '#19619C',
          600: '#0C3F69',
          700: '#031F36',
        },
        'gov-black': '#000103',
      },
    },
  },
  plugins: [],
}
export default config
