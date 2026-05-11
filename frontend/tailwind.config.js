/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0F1923',
        surface: {
          light: '#faf9f6',
          dark: '#1a242d',
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#18181b',
          900: '#09090b',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // electric blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          teal: '#14b8a6', // success/live
          ai: '#8b5cf6', // purple for intelligence
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      animation: {
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fadeIn 0.5s ease-out both',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'drop-bounce': 'dropBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        'typewriter': 'typing 1.5s steps(40, end)',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'none', opacity: '1' } },
        slideLeft: { 
          '0%': { transform: 'translateX(30px)', opacity: '0' }, 
          '100%': { transform: 'none', opacity: '1' } 
        },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        dropBounce: {
          '0%': { transform: 'translateY(-30px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' }
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' }
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(37, 99, 235, 0.35)',
        'glow-sm': '0 0 10px rgba(37, 99, 235, 0.2)',
        'ai-glow': '0 0 15px rgba(139, 92, 246, 0.4)',
        'card': '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
