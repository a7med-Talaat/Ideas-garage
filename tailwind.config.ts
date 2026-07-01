import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        garage: {
          bg: "#070710",
          surface: "#0f0f1a",
          panel: "#13131f",
          border: "#1e1e35",
          hover: "#1a1a2e",
        },
        neon: {
          blue: "#4f8ef7",
          purple: "#9b59f7",
          green: "#39d98a",
          orange: "#ff8c42",
          pink: "#f759ab",
          yellow: "#f7c948",
          cyan: "#38bdf8",
          red: "#f75959",
        },
        car: {
          ai: "#4f8ef7",
          business: "#39d98a",
          startup: "#ff8c42",
          content: "#f759ab",
          personal: "#9b59f7",
          research: "#38bdf8",
          design: "#f7c948",
          other: "#94a3b8",
        },
      },
      backgroundImage: {
        "garage-floor": "repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.02) 49px, rgba(255,255,255,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.02) 49px, rgba(255,255,255,0.02) 50px)",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "car-shine": "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        "neon-blue": "0 0 20px rgba(79, 142, 247, 0.4), 0 0 40px rgba(79, 142, 247, 0.1)",
        "neon-purple": "0 0 20px rgba(155, 89, 247, 0.4), 0 0 40px rgba(155, 89, 247, 0.1)",
        "neon-green": "0 0 20px rgba(57, 217, 138, 0.4), 0 0 40px rgba(57, 217, 138, 0.1)",
        "neon-orange": "0 0 20px rgba(255, 140, 66, 0.4), 0 0 40px rgba(255, 140, 66, 0.1)",
        "card": "0 4px 20px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)",
        "glass": "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)",
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in-up": "slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.3s ease-out",
        "car-park": "carPark 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s infinite linear",
        "spin-slow": "spin 3s linear infinite",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        carPark: {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(-20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
