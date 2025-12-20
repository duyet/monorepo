/**
 * Claude Theme
 *
 * Claude AI's warm, approachable color palette and design tokens.
 * This theme provides the foundation for Claude-branded applications.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    colors: {
      // Claude's warm color palette - accent colors
      claude: {
        peach: "#f5dcd0",
        mint: "#a8d5ba",
        lavender: "#c5c5ff",
        coral: "#ff9999",
        yellow: "#f0d9a8",
        sky: "#b3d9ff",
        beige: "#F4EFE6",
        cream: "#FBF7F0",
        tan: "#E6D9C9",
        brown: "#A07855",
        copper: "#CC785C",
        orange: "#D97757",
        black: "#1F1F1F",
      },
      // Claude's neutral gray scale
      "claude-gray": {
        50: "#F9F9F8",
        100: "#F3F2F0",
        200: "#E8E6E2",
        300: "#D4D1CB",
        400: "#A8A399",
        500: "#7C7869",
        600: "#5C5850",
        700: "#3D3C38",
        800: "#2B2A27",
        900: "#1F1F1F",
      },
    },
  },
  safelist: [
    // Claude color backgrounds
    {
      pattern:
        /^bg-claude-(peach|mint|lavender|coral|yellow|sky|beige|cream|tan|brown|copper|orange|black)$/,
      variants: ["hover", "dark"],
    },
    // Claude gray scale
    {
      pattern: /^bg-claude-gray-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ["hover", "dark"],
    },
    // Claude color text
    {
      pattern:
        /^text-claude-(peach|mint|lavender|coral|yellow|sky|beige|cream|tan|brown|copper|orange|black)$/,
      variants: ["hover", "dark"],
    },
    // Claude gray scale text
    {
      pattern: /^text-claude-gray-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ["hover", "dark"],
    },
    // Claude color borders
    {
      pattern:
        /^border-claude-(peach|mint|lavender|coral|yellow|sky|beige|cream|tan|brown|copper|orange|black)$/,
      variants: ["hover", "dark"],
    },
    // Claude gray scale borders
    {
      pattern: /^border-claude-gray-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ["hover", "dark"],
    },
  ],
};
