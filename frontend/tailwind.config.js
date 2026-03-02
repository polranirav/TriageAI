/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        // Pure neutral grays per design spec (not slate/blue-tinted)
        neutral: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':      ['32px', { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3':      ['20px', { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '600' }],
        'h4':      ['16px', { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6',  letterSpacing: '0',       fontWeight: '400' }],
        'body':    ['15px', { lineHeight: '1.5',  letterSpacing: '0',       fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5',  letterSpacing: '0',       fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.4',  letterSpacing: '0.04em',  fontWeight: '500' }],
      },
      borderRadius: {
        'xs': '4px', 'sm': '6px', 'md': '8px',
        'lg': '12px', 'xl': '16px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.4)',
        'sm': '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'md': '0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'lg': '0 8px 32px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
        'primary': '0 0 0 3px rgba(34,197,94,0.25)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 300ms cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fadeIn 200ms ease-out',
        'critical-pulse': 'criticalPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 7s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        criticalPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.6', boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
