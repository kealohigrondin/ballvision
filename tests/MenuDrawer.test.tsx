import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { MenuDrawer } from "@/shared/components/MenuDrawer";

afterEach(cleanup);

const renderMenu = () =>
  render(
    <MenuDrawer id="test-menu" label="Menu" closeLabel="Close menu">
      <span id="test-menu-item">Item</span>
    </MenuDrawer>,
  );

it("starts closed", () => {
  renderMenu();
  expect(document.getElementById("test-menu-drawer")).toBeNull();
});

it("opens to show its contents when the menu button is clicked", () => {
  renderMenu();
  fireEvent.click(document.getElementById("test-menu-button")!);
  const drawer = document.getElementById("test-menu-drawer");
  expect(drawer?.querySelector("#test-menu-item")).toBeTruthy();
});

it("closes on Escape", async () => {
  renderMenu();
  fireEvent.click(document.getElementById("test-menu-button")!);
  fireEvent.keyDown(document.getElementById("test-menu-drawer")!, {
    key: "Escape",
  });
  await waitFor(() =>
    expect(document.getElementById("test-menu-item")).toBeNull(),
  );
});

it("closes from its close button", async () => {
  renderMenu();
  fireEvent.click(document.getElementById("test-menu-button")!);
  fireEvent.click(document.getElementById("test-menu-close")!);
  await waitFor(() =>
    expect(document.getElementById("test-menu-item")).toBeNull(),
  );
});
