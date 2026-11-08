import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import MastHead from "../src/components/MastHead";
import { copy } from "../src/copy";
import { AppTheme } from "../src/providers/AppTheme";
import { createAppTheme } from "../src/theme";
import { AppDataTestProvider, createAppData } from "./helpers/appData";

afterEach(() => {
  cleanup();
  localStorage.removeItem("ballvision-color-mode");
  delete document.documentElement.dataset.theme;
});

it("switches themes from the masthead and remembers the preference on remount", () => {
  const app = (
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <MastHead />
      </AppDataTestProvider>
    </AppTheme>
  );
  const { unmount } = render(app);
  fireEvent.click(screen.getByRole("button", { name: copy.theme.toLight }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem("ballvision-color-mode")).toBe("light");
  unmount();
  render(app);
  fireEvent.click(screen.getByRole("button", { name: copy.theme.toDark }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("ballvision-color-mode")).toBe("dark");
});

it("uses a 12px typography baseline", () => {
  const { typography } = createAppTheme("dark");
  expect(typography.fontSize).toBe(12);
  expect(typography.body1.fontSize).toBe("0.75rem");
  expect(typography.body2.fontSize).toBe("0.75rem");
});
