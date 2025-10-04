/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown-primary': '#B8906B',
        'brown-secondary': '#A67C52',
        'cream': '#F5F5DC',
      }
    },
  },
  plugins: [],
}