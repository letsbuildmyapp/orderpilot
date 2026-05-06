/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "oklch(98% 0.012 85)",
          100: "oklch(96% 0.018 85)",
          200: "oklch(92% 0.022 85)",
        },
        ink: {
          DEFAULT: "oklch(22% 0.015 60)",
          soft: "oklch(35% 0.012 60)",
          // Darkened from 55% to 42% so muted text on cream-50 reaches >=4.5:1 (WCAG AA body)
          mute: "oklch(42% 0.012 60)",
        },
        accent: {
          DEFAULT: "oklch(38% 0.085 35)",
          soft: "oklch(58% 0.10 35)",
        },
        line: "oklch(85% 0.012 60)",
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      // HIG-aligned type scale (web-adapted). Display sizes intentionally large for editorial archetype.
      fontSize: {
        caption: ["12px", { lineHeight: "16px" }],
        footnote: ["13px", { lineHeight: "18px" }],
        subheadline: ["15px", { lineHeight: "20px" }],
        body: ["16px", { lineHeight: "24px" }],
        headline: ["17px", { lineHeight: "22px", fontWeight: "600" }],
        title3: ["20px", { lineHeight: "26px" }],
        title2: ["22px", { lineHeight: "28px" }],
        title1: ["28px", { lineHeight: "34px" }],
        largeTitle: ["34px", { lineHeight: "41px" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        prose: "65ch",
      },
      borderRadius: {
        none: "0px",
        md: "4px",
      },
    },
  },
  plugins: [],
};
