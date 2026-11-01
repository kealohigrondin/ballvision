import montserratUrl from "../assets/fonts/Montserrat-Variable.ttf";

export const getGlobalStyles = (mode: "light" | "dark") => ({
  "*": {
    boxSizing: "border-box",
  },
  body: {
    margin: "0",
    minHeight: "100vh",
    background: "var(--mui-app-background)",
    backgroundAttachment: "fixed",
    WebkitFontSmoothing: "antialiased",
  },
  "button,\ninput,\nselect": {
    font: "inherit",
  },
  "button,\na,\ninput": {
    WebkitTapHighlightColor: "var(--mui-app-colors-transparent)",
  },
  button: {
    cursor: "pointer",
    color: "inherit",
  },
  "button:disabled": {
    cursor: "default",
    opacity: "0.4",
  },
  "button:focus-visible,\na:focus-visible,\ninput:focus-visible,\nsummary:focus-visible,\nselect:focus-visible":
    {
      outline: "2px solid var(--mui-palette-primary-main)",
      outlineOffset: "4px",
    },
  a: {
    color: "inherit",
    textDecoration: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "*,\n  *:before,\n  *:after": {
      animation: "none !important",
      transition: "none !important",
    },
  },
  "@keyframes rotate": {
    to: {
      transform: "rotate(360deg)",
    },
  },
  "@font-face": {
    fontFamily: "Montserrat",
    src: `url(${montserratUrl}) format("truetype")`,
    fontStyle: "normal",
    fontWeight: "100 900",
    fontDisplay: "swap",
  },
  ":root": {
    color: "var(--mui-palette-text-primary)",
    background: "var(--mui-palette-background-default)",
    textRendering: "optimizeLegibility",
    colorScheme: mode,
  },
});
