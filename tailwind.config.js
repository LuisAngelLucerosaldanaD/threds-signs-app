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
        "muted-color": "#64748b",
        "emphasis": "#f1f5f9",
        "primary": "#020617",
        "primary-emphasis": "#1e293b",
        "color": "#334155"
      }
    },
  },
  plugins: [],
}
