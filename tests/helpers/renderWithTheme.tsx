import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { AppTheme } from "../../src/providers/AppTheme";

// Renders inside the app theme, which components read for shared tokens.
export const renderWithTheme = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AppTheme, ...options });
