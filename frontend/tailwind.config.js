/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#f5f5f7',
        surface: '#ffffff',
        accent: '#0066cc',
        aqi: {
          good: "#00E400",
          satisfactory: "#9CFF00",
          moderate: "#FFFF00",
          poor: "#FF7E00",
          verypoor: "#FF0000",
          severe: "#99004C",
          hazard: "#7E0023"
        }
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
