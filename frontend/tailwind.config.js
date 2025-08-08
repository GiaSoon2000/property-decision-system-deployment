/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify files where Tailwind classes will be used
  content: [
    "./src/components/tailwind/**/*.{js,jsx,ts,tsx}",
    "./src/pages/tailwind/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/**/*.{js,jsx,ts,tsx}"
  ],
  
  // Prevent Tailwind from generating global styles
  important: false,
  
  // Prefix all Tailwind classes to avoid conflicts
  prefix: 'tw-',
  
  // Your theme configuration
  theme: {
    extend: {},
  },
  
  // Disable core plugins you don't want to affect global styles
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles
  },
  
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}

