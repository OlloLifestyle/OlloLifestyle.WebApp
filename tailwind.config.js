/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'oxford-blue': '#002147',
        'peach': '#FBBF24',
        'green': '#22C55E',
      },
    },
  },
  plugins: [],
}