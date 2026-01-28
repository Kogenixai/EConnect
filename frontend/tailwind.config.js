/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  container: {
    center: true,
    padding: "1rem",
    screens: {
      sm: "100%",
      md: "100%",
      lg: "1440px",
      xl: "1280px",
    },
  },

  theme: {
    extend: {
      fontFamily: {
        Opensans: ["Open Sans"],
        Bitter: ["Bitter"],
        Merriweather: ["Merriweather"],
        Noticia: ["Noticia"],
        Poppins: ["Poppins"],
        Domine: ["Domine"],
        prompt: ["Prompt"],
      },
      colors: {
        color1: "#76ad5f",
        color2: "#8BB977",
        color3: "#6d9eeb",
        
        blue: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#bdccddff',
          400: '#94a3b8',
          500: '#6490c7ff',
          600: '#6393ceff',  // sidebar bg
          700: '#517db4ff',  // hover state
          800: '#416ca1ff',
          900: '#0f172a',
          950: '#020617',
        },
        green: {
          500: '#7acd86ff',
          600: '#51ba80ff',
        },
        red: {
          500: '#c06767ff',
          600: '#944c4cff',
        },
        yellow: {
          100: '#f6f1bbff',
          200: '#fde68a',  
          300: '#fcd34d', 
          400: '#fbbf24',
          500: '#f59e0b', 
          600: '#d97706', 
          700: '#f5d879ff', 
        },
      },
    },
  },
  plugins: [],
};
