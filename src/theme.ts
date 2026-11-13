import { alpha, createTheme } from "@mui/material/styles";

import msSansSerif from "./assets/fonts/ms_sans_serif.woff2";
import msSansSerifBold from "./assets/fonts/ms_sans_serif_bold.woff2";

// Colors for the Windows 98 style boxes: the app's own palette with
// Windows 98 bevel structure, from the Windows 98 Design System Figma file.
type Win98Colors = {
  face: string;
  light: string;
  highlight: string;
  shadow: string;
  darkShadow: string;
  desktop: string;
  field: string;
  text: string;
  primary: string;
  titleStart: string;
  titleEnd: string;
};

type Win98Tokens = {
  colors: Win98Colors;
  bevel: {
    window: string;
    button: string;
    pressed: string;
    field: string;
  };
  titleBar: string;
  selected: string;
};

type AppTokens = {
  controlHeight: string;
  controlBorderRadius: string;
  paperBorderRadius: string;
  boxScoreMinWidth: number;
  periodColumnPadding: string;
  navigationBarHeight: number;
  win98: Win98Tokens;
};

declare module "@mui/material/styles" {
  interface Theme {
    app: AppTokens;
  }
  interface ThemeOptions {
    app?: AppTokens;
  }
}

// Title bars use a gradient that ends on the light theme's green, with
// white text, in both modes.
const titleBar = { titleStart: "#0b3d1d", titleEnd: "#16783a" };

const win98Colors: Record<"light" | "dark", Win98Colors> = {
  light: {
    face: "#ffffff",
    light: "#e0e0e0",
    highlight: "#ffffff",
    shadow: "#bdbdbd",
    darkShadow: "#757575",
    desktop: "#ffffff",
    field: "#ffffff",
    text: "rgba(0, 0, 0, 0.87)",
    primary: "#16783a",
    ...titleBar,
  },
  dark: {
    face: "#1e1e1e",
    light: "#2e2e2e",
    highlight: "#4a4a4a",
    shadow: "#0a0a0a",
    darkShadow: "#000000",
    desktop: "#121212",
    field: "#121212",
    text: "#ffffff",
    primary: "#67e68d",
    ...titleBar,
  },
};

const win98Tokens = (colors: Win98Colors): Win98Tokens => {
  const {
    light,
    highlight,
    shadow,
    darkShadow,
    primary,
    titleStart,
    titleEnd,
  } = colors;

  return {
    colors,
    // Inner shadows from the Figma "Window Framing", "Button Framing" and
    // sunken field effects.
    bevel: {
      window: `inset -1px -1px ${darkShadow}, inset 1px 1px ${light}, inset -2px -2px ${shadow}, inset 2px 2px ${highlight}`,
      button: `inset -1px -1px ${darkShadow}, inset 1px 1px ${highlight}, inset -2px -2px ${shadow}, inset 2px 2px ${light}`,
      pressed: `inset -1px -1px ${highlight}, inset 1px 1px ${darkShadow}, inset -2px -2px ${light}, inset 2px 2px ${shadow}`,
      field: `inset -1px -1px ${highlight}, inset 1px 1px ${shadow}, inset -2px -2px ${light}, inset 2px 2px ${darkShadow}`,
    },
    titleBar: `linear-gradient(90deg, ${titleStart}, ${titleEnd})`,
    // The tint behind a latched (selected) button.
    selected: alpha(primary, 0.16),
  };
};

const fontFamily = [
  '"Pixelated MS Sans Serif"',
  '"MS Sans Serif"',
  '"Microsoft Sans Serif"',
  "Tahoma",
  "sans-serif",
].join(", ");

export const createAppTheme = (mode: "light" | "dark") => {
  const win98 = win98Tokens(win98Colors[mode]);
  const { colors, bevel } = win98;
  const focusRing = {
    outline: `1px dotted ${colors.text}`,
    outlineOffset: -4,
  };
  const disabledText = {
    color: colors.shadow,
    // Light mode embosses disabled text the way Windows 98 does.
    textShadow: mode === "light" ? `1px 1px 0 ${colors.highlight}` : "none",
  };
  const raisedButton = {
    borderRadius: 0,
    border: 0,
    color: colors.text,
    backgroundColor: colors.face,
    boxShadow: bevel.button,
    textTransform: "none",
    "&:hover": { backgroundColor: colors.face, boxShadow: bevel.button },
    "&:active": { boxShadow: bevel.pressed },
    "&.Mui-focusVisible": focusRing,
    "&.Mui-disabled": { ...disabledText, boxShadow: bevel.button },
  } as const;

  return createTheme({
    cssVariables: true,
    app: {
      controlHeight: "32px",
      controlBorderRadius: "0px",
      paperBorderRadius: "0px",
      boxScoreMinWidth: 325,
      periodColumnPadding: "0.4rem",
      navigationBarHeight: 80,
      win98,
    },
    shape: { borderRadius: 0 },
    shadows: Array(25).fill("none") as ReturnType<
      typeof createTheme
    >["shadows"],
    typography: {
      fontFamily,
      // MUI scales every variant from this base (its default is 14).
      fontSize: 12,
      button: { textTransform: "none" },
    },
    palette: {
      mode,
      primary: { main: colors.primary },
      background: { default: colors.desktop, paper: colors.face },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: "Pixelated MS Sans Serif";
            src: url(${msSansSerif}) format("woff2");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: "Pixelated MS Sans Serif";
            src: url(${msSansSerifBold}) format("woff2");
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }
          body {
            -webkit-font-smoothing: none;
            -moz-osx-font-smoothing: grayscale;
          }
        `,
      },
      MuiButtonBase: {
        styleOverrides: { root: { fontFamily } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: "none",
            backgroundColor: colors.face,
            boxShadow: bevel.window,
            "&:is(article)": { padding: 3, overflow: "hidden" },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            boxShadow: "none",
            "&::before": { display: "none" },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            borderTop: `1px solid ${colors.shadow}`,
            boxShadow: `inset 0 1px 0 ${colors.highlight}`,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: {
            ...raisedButton,
            height: "var(--mui-app-controlHeight)",
            minWidth: 75,
            paddingInline: 12,
          },
        },
      },
      MuiIconButton: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          // Flat toolbar buttons that raise on hover and sink when pressed.
          root: {
            borderRadius: 0,
            color: colors.text,
            "&:hover": {
              backgroundColor: "transparent",
              boxShadow: bevel.button,
            },
            "&:active": { boxShadow: bevel.pressed },
            "&.Mui-focusVisible": focusRing,
            "&.Mui-disabled": { color: colors.shadow },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: { gap: 2, borderRadius: 0 },
          grouped: {
            "&&": { margin: 0, border: 0, borderRadius: 0 },
          },
        },
      },
      MuiToggleButton: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            ...raisedButton,
            height: "var(--mui-app-controlHeight)",
            "&.Mui-selected, &.Mui-selected:hover": {
              color: colors.primary,
              backgroundColor: win98.selected,
              boxShadow: bevel.pressed,
            },
          },
        },
      },
      MuiTextField: { defaultProps: { size: "small" } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            height: "var(--mui-app-controlHeight)",
            borderRadius: 0,
            backgroundColor: colors.field,
            boxShadow: bevel.field,
            "& .MuiOutlinedInput-notchedOutline": { border: 0 },
            "&.Mui-focused": { outline: `1px dotted ${colors.text}` },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          // Sits on the field's top edge like a Windows 98 group box title.
          shrink: {
            backgroundColor: colors.face,
            paddingInline: 4,
            color: colors.text,
            "&.Mui-focused": { color: colors.text },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            top: 2,
            right: 2,
            height: "calc(100% - 4px)",
            width: 20,
            color: colors.text,
            backgroundColor: colors.face,
            boxShadow: bevel.button,
          },
        },
      },
      MuiNativeSelect: {
        styleOverrides: {
          icon: {
            top: 2,
            right: 2,
            height: "calc(100% - 4px)",
            width: 20,
            color: colors.text,
            backgroundColor: colors.face,
            boxShadow: bevel.button,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700 },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            background: win98.titleBar,
            color: "#ffffff",
            fontWeight: 700,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 0 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 0, boxShadow: bevel.field },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            backgroundColor: colors.field,
            boxShadow: bevel.field,
          },
        },
      },
      MuiLink: {
        styleOverrides: { root: { color: "inherit" } },
      },
    },
  });
};

export const theme = createAppTheme("dark");
