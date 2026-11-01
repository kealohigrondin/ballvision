import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { AppTheme } from "../src/components/AppTheme";
import MastHead from "../src/components/MastHead";

afterEach(() => {
  cleanup();
  localStorage.removeItem("ballvision-color-mode");
  delete document.documentElement.dataset.theme;
});

it("switches themes from the masthead and remembers the preference on remount", () => {
  const app = (
    <AppTheme>
      <MastHead
        loading={false}
        paused={false}
        error={null}
        updatedAt={null}
        refresh={() => {}}
        onTogglePause={() => {}}
      />
    </AppTheme>
  );
  const { unmount } = render(app);
  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem("ballvision-color-mode")).toBe("light");
  unmount();
  render(app);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("ballvision-color-mode")).toBe("dark");
});
