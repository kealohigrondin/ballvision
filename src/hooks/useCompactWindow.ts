import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * True for the Material Design 3 "compact" window size class (< 600dp),
 * where navigation moves from a side rail to a bottom navigation bar.
 */
export const useCompactWindow = () => {
  const theme = useTheme();

  return useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
};
