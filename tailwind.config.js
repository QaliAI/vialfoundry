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
          canvas: 'var(--brand-canvas)',
          paper: 'var(--brand-paper)',
          ink: 'var(--brand-ink)',
          graphite: 'var(--brand-graphite)',
          steel: 'var(--brand-steel)',
          metal: 'var(--brand-metal)',
          mineral: 'var(--brand-mineral)',
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          accent: 'var(--brand-accent)',
          'accent-hover': 'var(--brand-accent-hover)',
          bronze: 'var(--brand-bronze)',
          surface: 'var(--brand-surface)',
          'surface-muted': 'var(--brand-surface-muted)',
          text: 'var(--brand-text)',
          'text-muted': 'var(--brand-text-muted)',
          border: 'var(--brand-border)',
          'border-strong': 'var(--brand-border-strong)',
          success: 'var(--brand-success)',
          warning: 'var(--brand-warning)',
          danger: 'var(--brand-danger)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(27, 29, 31, 0.03)',
        'xs': '0 1px 3px 0 rgba(27, 29, 31, 0.04), 0 1px 2px -1px rgba(27, 29, 31, 0.04)',
        'subtle': '0 1px 3px 0 rgba(27, 29, 31, 0.04), 0 1px 2px -1px rgba(27, 29, 31, 0.04)',
        'card': '0 2px 5px -1px rgba(27, 29, 31, 0.05), 0 1px 3px -1px rgba(27, 29, 31, 0.04)',
        'card-hover': '0 10px 20px -3px rgba(27, 29, 31, 0.07), 0 4px 6px -2px rgba(27, 29, 31, 0.03)',
        'elevated': '0 20px 25px -5px rgba(27, 29, 31, 0.08), 0 8px 10px -6px rgba(27, 29, 31, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
