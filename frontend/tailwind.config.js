/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        surface: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#18181b',
          900: '#09090b',
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139,92,246,0.35)',
        'glow-sm': '0 0 10px rgba(139,92,246,0.2)',
        'card': '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
