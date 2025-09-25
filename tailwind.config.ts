import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: {
          pink: "hsl(var(--neon-pink))",
          blue: "hsl(var(--neon-blue))",
          green: "hsl(var(--neon-green))",
          yellow: "hsl(var(--neon-yellow))",
          purple: "hsl(var(--neon-purple))",
          orange: "hsl(var(--neon-orange))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-rainbow": {
          "0%": { borderColor: "hsl(var(--neon-pink))", boxShadow: "0 0 20px hsl(var(--neon-pink) / 0.5)" },
          "25%": { borderColor: "hsl(var(--neon-blue))", boxShadow: "0 0 20px hsl(var(--neon-blue) / 0.5)" },
          "50%": { borderColor: "hsl(var(--neon-green))", boxShadow: "0 0 20px hsl(var(--neon-green) / 0.5)" },
          "75%": { borderColor: "hsl(var(--neon-yellow))", boxShadow: "0 0 20px hsl(var(--neon-yellow) / 0.5)" },
          "100%": { borderColor: "hsl(var(--neon-purple))", boxShadow: "0 0 20px hsl(var(--neon-purple) / 0.5)" }
        },
        "spin-wheel": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(1800deg)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
        },
        "flash": {
          "0%, 50%, 100%": { opacity: "1" },
          "25%, 75%": { opacity: "0.3" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-rainbow": "pulse-rainbow 2s ease-in-out infinite alternate",
        "spin-wheel": "spin-wheel 3s cubic-bezier(0.23, 1, 0.320, 1) forwards",
        "shake": "shake 0.5s ease-in-out",
        "flash": "flash 1s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
