/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vku: {
          blue: '#005696',
          darkBlue: '#003e6d',
          orange: '#f37021',
          gold: '#fdb913',
          lightBg: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
