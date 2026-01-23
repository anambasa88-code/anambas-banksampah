/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    // kalau lo punya folder lain yang pakai class Tailwind, tambahin di sini
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}