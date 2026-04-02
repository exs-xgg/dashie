/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fcfcfd',
        surface: '#ffffff',
        primary: '#6d28d9', // Deep Purple
        secondary: '#7c3aed', // Purpleish
        'secondary-dim': '#6d28d9',
        accent: '#f43f5e', // Rose
        error: '#ef4444',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
        zinc: {
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        logo: ['Barriecito', 'cursive'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
