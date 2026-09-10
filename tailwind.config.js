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
        brand: {
          /* Approved palette (source of truth) */
          midnight: 'rgb(var(--brand-midnight) / <alpha-value>)',
          teal: 'rgb(var(--brand-teal) / <alpha-value>)',
          slate: 'rgb(var(--brand-slate) / <alpha-value>)',
          mist: 'rgb(var(--brand-mist) / <alpha-value>)',
          cloud: 'rgb(var(--brand-cloud) / <alpha-value>)',
          'midnight-light': 'rgb(var(--brand-midnight-light) / <alpha-value>)',
          'midnight-deep': 'rgb(var(--brand-midnight-deep) / <alpha-value>)',
          'teal-deep': 'rgb(var(--brand-teal-deep) / <alpha-value>)',
          /* Semantic roles */
          canvas: 'rgb(var(--brand-canvas) / <alpha-value>)',
          paper: 'rgb(var(--brand-paper) / <alpha-value>)',
          ink: 'rgb(var(--brand-ink) / <alpha-value>)',
          graphite: 'rgb(var(--brand-graphite) / <alpha-value>)',
          steel: 'rgb(var(--brand-steel) / <alpha-value>)',
          metal: 'rgb(var(--brand-metal) / <alpha-value>)',
          mineral: 'rgb(var(--brand-mineral) / <alpha-value>)',
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--brand-primary-hover) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--brand-accent-hover) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          'surface-muted': 'rgb(var(--brand-surface-muted) / <alpha-value>)',
          text: 'rgb(var(--brand-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--brand-text-muted) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
          'border-strong': 'rgb(var(--brand-border-strong) / <alpha-value>)',
          success: 'rgb(var(--brand-success) / <alpha-value>)',
          warning: 'rgb(var(--brand-warning) / <alpha-value>)',
          danger: 'rgb(var(--brand-danger) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 39, 64, 0.03)',
        'xs': '0 1px 3px 0 rgba(15, 39, 64, 0.04), 0 1px 2px -1px rgba(15, 39, 64, 0.04)',
        'subtle': '0 1px 3px 0 rgba(15, 39, 64, 0.04), 0 1px 2px -1px rgba(15, 39, 64, 0.04)',
        'card': '0 2px 5px -1px rgba(15, 39, 64, 0.05), 0 1px 3px -1px rgba(15, 39, 64, 0.04)',
        'card-hover': '0 10px 20px -3px rgba(15, 39, 64, 0.07), 0 4px 6px -2px rgba(15, 39, 64, 0.03)',
        'elevated': '0 20px 25px -5px rgba(15, 39, 64, 0.08), 0 8px 10px -6px rgba(15, 39, 64, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
