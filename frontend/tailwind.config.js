/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Neutralized design system tokens
        canvas: '#E9E9E4',
        surface: {
          DEFAULT: '#F4F4F0',
          raised: '#F4F4F0',
          alt: '#EEEEEA',
          secondary: '#EEEEEA',
          inset: '#E3E4DE',
        },
        ink: {
          DEFAULT: '#252B26',
          primary: '#252B26',
          secondary: '#687068',
          muted: '#8C948C',
        },
        neutral: {
          border: '#DEDFD8',
          surface: '#F4F4F0',
          secondary: '#EEEEEA',
          input: '#E3E4DE',
        },
        forest: {
          50: '#F4F7F4',
          100: '#E4EDE5',
          200: '#C7DBC9',
          300: '#9EC2A2',
          400: '#5BA364',
          500: '#239553',
          600: '#168447', // Primary forest green
          700: '#106638', // Dark green hover
          800: '#0C4E2B',
          900: '#083B21',
          950: '#042213',
        },
        water: {
          50: '#F2F6F9',
          100: '#E2ECF3',
          200: '#BFD8E7',
          300: '#8FBED6',
          400: '#519EC3',
          500: '#2880A8',
          600: '#1D6789',
          700: '#17526E',
          800: '#134259',
          900: '#0F3446',
          950: '#08212D',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        // Neutralized neumorphic tactile directional shadows (warm gray shadow, white highlight)
        'neu': '5px 5px 12px rgba(80, 82, 78, 0.10), -5px -5px 12px rgba(255, 255, 255, 0.95)',
        'neu-sm': '3px 3px 7px rgba(80, 82, 78, 0.08), -3px -3px 7px rgba(255, 255, 255, 0.92)',
        'neu-lg': '8px 8px 18px rgba(80, 82, 78, 0.12), -8px -8px 18px rgba(255, 255, 255, 0.98)',
        'neu-inset': 'inset 2.5px 2.5px 5px rgba(80, 82, 78, 0.10), inset -2.5px -2.5px 5px rgba(255, 255, 255, 0.90)',
        'neu-inset-sm': 'inset 1.5px 1.5px 3px rgba(80, 82, 78, 0.08), inset -1.5px -1.5px 3px rgba(255, 255, 255, 0.85)',
        'neu-btn': '3px 3px 8px rgba(22, 132, 71, 0.28), -2px -2px 6px rgba(255, 255, 255, 0.7)',
        'neu-btn-pressed': 'inset 2px 2px 4px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'page-enter': 'pageEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
