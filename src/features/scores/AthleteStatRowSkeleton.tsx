import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type AthleteStatRowSkeletonProps = {
  align?: "start" | "end";
  /** Reserve a second stat line on phones, where long stat lines wrap. */
  wrapsOnPhones?: boolean;
};

// The shape of an athlete stat row while it loads: a photo and three lines
// for name, details and stats. "end" mirrors it like the real row.
export const AthleteStatRowSkeleton = ({
  align = "start",
  wrapsOnPhones = false,
}: AthleteStatRowSkeletonProps) => (
  <Stack
    direction={align === "end" ? "row-reverse" : "row"}
    spacing={1}
    sx={{ alignItems: "center", minWidth: 0 }}
  >
    <Skeleton variant="circular" width={36} height={36} />
    <Stack sx={{ flex: 1, alignItems: align === "end" ? "flex-end" : "start" }}>
      {/* Each line sits in the same typography as the real row, so the
          placeholder takes exactly the same height. */}
      <Typography component="span" sx={{ width: "70%" }}>
        <Skeleton />
      </Typography>
      <Typography component="span" variant="caption" sx={{ width: "40%" }}>
        <Skeleton />
      </Typography>
      <Typography component="span" variant="body2" sx={{ width: "85%" }}>
        <Skeleton />
      </Typography>
      {wrapsOnPhones && (
        <Typography
          component="span"
          variant="body2"
          sx={{ width: "40%", display: { xs: "block", sm: "none" } }}
        >
          <Skeleton />
        </Typography>
      )}
    </Stack>
  </Stack>
);
