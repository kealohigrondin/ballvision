import { useId } from "react";
import Box from "@mui/material/Box";
import chalkCircleUrl from "../assets/red-chalk-circle.png";

type ScoreChalkCircleProps = Record<string, never>;

export const ScoreChalkCircle = ({}: ScoreChalkCircleProps) => {
  const filterId = `score-chalk-${useId().replace(/:/g, "")}`;
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transform: "scale(1.1)",
      }}
    >
      <Box component="svg" width="0" height="0" sx={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            {/* Neutral checkerboard pixels have equal red and green channels. */}
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.5 -1.5 0 0 0"
            />
          </filter>
        </defs>
      </Box>
      <Box
        component="img"
        src={chalkCircleUrl}
        alt=""
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          filter: `url(#${filterId})`,
        }}
      />
    </Box>
  );
};
