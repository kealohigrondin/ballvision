import { expect, it } from "vitest";

import { getGameGridSize } from "@/features/scores/gameGridLayout";

it.each([
  { compact: true, cardsPerRow: 3 },
  { compact: false, cardsPerRow: 4 },
])(
  "fits $cardsPerRow cards per lg row with compact=$compact",
  ({ compact, cardsPerRow }) => {
    expect(12 / getGameGridSize(compact).lg).toBe(cardsPerRow);
  },
);
