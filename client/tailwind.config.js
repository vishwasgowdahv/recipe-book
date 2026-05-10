// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Crucial for scanning your React components
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#FAFAFA',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        pacifico: ['Pacifico', 'Lora', 'serif']
      }
    },
  },
  plugins: [],
};