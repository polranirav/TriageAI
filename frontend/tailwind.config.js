/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Clinical Blue Primary ──
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3B82F6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          glow: 'rgba(59,130,246,0.12)',
        },

        // ── Layered Navy Backgrounds ──
        canvas: '#070C18',
        sidebar: '#0B1120',
        surface: '#0F172A',
        card: '#162033',
        'card-hover': '#1E2D45',
        modal: '#1A2540',

        // ── Borders ──
        'border-subtle': '#1E2D45',
        'border-default': '#243554',
        'border-active': '#2D4A78',

        // ── Text ──
        'text-primary': '#E8F0FE',
        'text-secondary': '#7A8FA8',
        'text-muted': '#3D5068',
        'text-mono': '#64D8A3',

        // ── CTAS Severity System ──
        ctas: {
          1: { solid: '#FF2D2D', bg: '#FF2D2D1A', border: '#FF2D2D40' },
          2: { solid: '#FF6B00', bg: '#FF6B001A', border: '#FF6B0040' },
          3: { solid: '#F0B429', bg: '#F0B4291A', border: '#F0B42940' },
          4: { solid: '#3B82F6', bg: '#3B82F61A', border: '#3B82F640' },
          5: { solid: '#10B981', bg: '#10B9811A', border: '#10B98140' },
        },

        // ── System Status ──
        status: {
          live: '#10B981',
          warning: '#F0B429',
          critical: '#FF2D2D',
          inactive: '#3D5068',
          escalated: '#FF6B00',
        },

        // ── Keep neutrals for compatibility ──
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },

      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'section': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '500' }],
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'mono-data': ['13px', { lineHeight: '1.5', fontWeight: '400' }],

        // Legacy sizes kept for compatibility
        'display': ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h4': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
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
        'primary': '0 0 0 3px rgba(59,130,246,0.25)',
        'l1-pulse': '0 0 0 0 rgba(255,45,45,0.4)',
      },

      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 300ms cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fadeIn 200ms ease-out',
        'critical-pulse': 'criticalPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 7s ease-in-out infinite',
        'l1-pulse': 'l1Pulse 2s ease-in-out infinite',
        'ecg-trace': 'ecgTrace 2s linear infinite',
        'waveform-bar': 'waveformBar 0.6s ease-in-out infinite alternate',
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
          '50%': { opacity: '.6', boxShadow: '0 0 15px rgba(255, 45, 45, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        l1Pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255,45,45,0.4)' },
          '70%': { boxShadow: '0 0 0 8px rgba(255,45,45,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,45,45,0)' },
        },
        ecgTrace: {
          '0%': { strokeDashoffset: '300' },
          '100%': { strokeDashoffset: '0' },
        },
        waveformBar: {
          '0%': { height: '8px' },
          '100%': { height: '32px' },
        },
      },
    },
  },
  plugins: [],
}
