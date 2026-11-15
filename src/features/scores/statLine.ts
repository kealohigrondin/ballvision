export type StatLinePart = { text: string; value: boolean };

/** Splits a stat summary like "8/9, 60 YDS" into numbers and labels. */
export const splitStatLine = (line: string): StatLinePart[] =>
  line
    .split(/(\d+(?:[./-]\d+)*)/)
    .filter(Boolean)
    .map((text) => ({ text, value: /^\d/.test(text) }));
