import Box from "@mui/material/Box";

type StatShareBarProps = {
  /** The left side's share of the total, from 0 to 1; omit when both are 0. */
  share?: number;
  /** CSS backgrounds for the left and right segments. */
  leftFill: string;
  rightFill: string;
};

// A thin bar split between two sides by their share of a stat. With nothing
// to compare it shows an empty track.
export const StatShareBar = ({
  share,
  leftFill,
  rightFill,
}: StatShareBarProps) => {
  const left = Math.min(1, Math.max(0, share ?? 0)) * 100;

  return (
    <Box
      aria-hidden
      sx={{
        display: "flex",
        gap: "2px",
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "action.hover",
      }}
    >
      {share !== undefined && (
        <Box sx={{ width: `${left}%`, background: leftFill }} />
      )}
      {share !== undefined && <Box sx={{ flex: 1, background: rightFill }} />}
    </Box>
  );
};
