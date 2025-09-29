/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#15AA7A',
        neutral: '#0F75BC',
        'brand-l': '#019D01',
      }
    },
  },
  plugins: [],
}
