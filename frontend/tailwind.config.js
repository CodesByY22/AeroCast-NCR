/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#fafafa',
        surface: '#ffffff',
        accent: '#2b6cb0',
        textMain: '#1a1a1a',
        textMuted: '#71717a',
        borderSubtle: '#e4e4e7',
        aqi: {
          good: "#22c55e",
          satisfactory: "#84cc16",
          moderate: "#eab308",
          poor: "#f97316",
          verypoor: "#ef4444",
          severe: "#b91c1c",
          hazard: "#7f1d1d"
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
