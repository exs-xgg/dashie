/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f9f9',
        surface: '#ffffff',
        primary: '#5f5e61',
        secondary: '#006e2e',
        'secondary-dim': '#006127',
        error: '#9e3f4e',
        'on-surface': '#2d3435',
        'on-surface-variant': '#5a6061',
        zinc: {
          950: '#09090b',
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
