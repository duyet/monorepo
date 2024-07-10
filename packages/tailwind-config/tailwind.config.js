import merge from "deepmerge";

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const tremorTheme = require("./tremor.theme.js").theme;
const shadcnTheme = require("./shadcn.theme.js").theme;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Related path
    "../../apps/*/{app,components}/*.{js,ts,jsx,tsx}",
    "../../apps/*/{app,components}/**/*.{js,ts,jsx,tsx}",
    "../../packages/{components,libs}/*.{js,ts,jsx,tsx}",
    "../../packages/components/ui/*.{js,ts,jsx,tsx}",
    // Path to the tremor module
    "../../node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
    "../../packages/components/node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
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
      ...merge.all([
        tremorTheme,
        shadcnTheme,
        {
          colors: {
            gold: "#ffd465",
          },
        },
      ]),

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
              overflowWrap: "break-word",
              whiteSpace: "break-spaces",
              wordBreak: "break-word",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            'a[href^="https://"]': {
              "&::after": {
                content: '"↗︎"',
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
            code: {
              overflowWrap: "break-word",
              wordBreak: "break-word",
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
    require("tailwindcss-animate"),
    ...require("./tremor.theme.js").plugins,
    addVariablesForColors,
  ],
  darkMode: ["class", 'html[class~="dark"]'],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
// https://ui.aceternity.com/components/background-boxes
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
