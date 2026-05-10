import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2D5F3F',
          DEFAULT: '#3D7A52',
          dark: '#234A30',
          container: '#E8F5E9',
        },
        secondary: {
          light: '#8D6E63',
          DEFAULT: '#6D4C41',
          dark: '#5D4037',
          container: '#EFEBE9',
        },
        tertiary: {
          light: '#4FC3F7',
          DEFAULT: '#0288D1',
          dark: '#01579B',
          container: '#E1F5FE',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          variant: '#F5F5F5',
          container: '#FFFFFF',
          highest: '#ECEFF1',
        },
        on: {
          primary: '#FFFFFF',
          'primary-container': '#1A3D27',
          secondary: '#FFFFFF',
          'secondary-container': '#3E2723',
          surface: '#1C1B1F',
          'surface-variant': '#49454F',
        },
        outline: {
          DEFAULT: '#DDDDDD',
          variant: '#E8E8E8',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#E53935',
        info: '#2196F3',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '4rem', fontWeight: '700' }],
        'display-md': ['2.8125rem', { lineHeight: '3.25rem', fontWeight: '600' }],
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '600' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '500' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }],
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        full: '9999px',
      },
      boxShadow: {
        elevation1: '0 1px 4px rgba(0,0,0,0.05)',
        elevation2: '0 2px 8px rgba(0,0,0,0.10)',
        elevation3: '0 4px 12px rgba(0,0,0,0.15)',
        elevation4: '0 8px 16px rgba(0,0,0,0.20)',
      },
      spacing: {
        4.5: '18px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
