/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#624185',
          dark: '#3b2747',
          deep: '#472151',
          light: '#7e57a8',
        },
        secondary: {
          DEFAULT: '#ffa345',
          light: '#f2ad73',
          dark: '#e58724',
        },
        offWhite: '#f8f8ff',
        darkBlack: '#161618',
        brand: {
          primary: '#624185',
          secondary: '#ffa345',
          accent: '#ffa345',
          bg: '#FFFFFF',
          surface: '#f8f8ff',
        },
        status: {
          valid: '#059669',      // Emerald Green
          validBg: '#ECFDF5',
          revoked: '#DC2626',    // Crimson Red
          revokedBg: '#FEF2F2',
          warning: '#D97706',    // Amber
          warningBg: '#FFFBEB',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Noto Sans Thai', 'system-ui', '-apple-system', 'sans-serif'],
        thai: ['Noto Sans Thai', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(98, 65, 133, 0.08), 0 2px 6px -1px rgba(98, 65, 133, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(98, 65, 133, 0.16), 0 4px 12px -2px rgba(98, 65, 133, 0.08)',
      }
    },
  },
  plugins: [],
}
