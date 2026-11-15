// Columns shared by the scoring summary's period headers and plays: the
// scoring team's logo, the play, then the away and home scores.
export const scoringPlayGridSx = {
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr) 3ch 3ch",
  columnGap: 1.5,
  alignItems: "center",
} as const;
