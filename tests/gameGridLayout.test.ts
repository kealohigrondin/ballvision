import { expect, it } from "vitest";
import { getGameGridSize } from "../src/utils/gameGridLayout";

it.each([true, false])(
  "fits three cards per lg row with compact=%s",
  (compact) => {
    expect(getGameGridSize(compact).lg).toBe(4);
  },
);
