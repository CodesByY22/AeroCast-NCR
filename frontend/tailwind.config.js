/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#00E400",
          satisfactory: "#9CFF00",
          moderate: "#FFFF00",
          poor: "#FF7E00",
          verypoor: "#FF0000",
          severe: "#99004C",
          hazard: "#7E0023"
        }
      }
    },
  },
  plugins: [],
}
