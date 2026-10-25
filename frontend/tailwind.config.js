/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#090D16',
        'bg-card': '#111827',
        'border-card': '#1F2937',
        'accent-cyan': '#06B6D4',
        'accent-emerald': '#10B981',
        'accent-rose': '#F43F5E',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81'
        }
      }
    },
  },
  plugins: [],
}
