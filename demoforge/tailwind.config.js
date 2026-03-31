/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base:     '#080C18',
        surface:  '#0F1629',
        elevated: '#151D35',
        border:   '#1F2B4A',
        accent:   '#4461F2',
        'accent-h': '#3451E0',
        primary:  '#F0F4FF',
        secondary:'#8B95B5',
        muted:    '#4A5578',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
