/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Related path
    "../../apps/**/*.{js,ts,jsx,tsx}",
    "../../packages/**/*.{js,ts,jsx,tsx}",
    // Path to the tremor module
    "../../node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
  ],
  variants: {
    extend: {
      opacity: ["disabled"],
      typography: ["dark"],
    },
    typography: ["dark"],
  },
  theme: {
    extend: {
      ...require("./tremor.theme.js").theme,
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black.100"),
            a: {
              color: theme("colors.blue.600"),
              textDecoration: "none",
              textDecorationThickness: "from-font",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "break-spaces",
              wordBreak: "break-word",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            h1: {
              fontWeight: theme("fontWeight.semibold"),
              fontSize: theme("fontSize.3xl"),
              marginTop: theme("spacing.10"),
            },
            pre: {
              padding: 5,
            },
          },
        },
        dark: {
          css: {
            a: {
              color: theme("colors.white"),
              textDecoration: "underline",
            },
          },
        },
      }),
    },
    hljs: {
      theme: "night-owl",
      custom: {
        base: {
          background: "transparent",
        },
      },
    },
  },
  safelist: [
    {
      pattern: /hljs+/,
    },
    ...require("./tremor.theme.js").safelist,
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-highlightjs"),
    ...require("./tremor.theme.js").plugins,
  ],
  darkMode: ["class", 'html[class~="dark"]'],
};
