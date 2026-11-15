import type { Page } from "@playwright/test";

export type ShownNotification = { title: string; body?: string; tag?: string };

declare global {
  interface Window {
    shownNotifications: ShownNotification[];
  }
}

// Replaces the browser's Notification API before the app loads, so tests can
// see what would reach the desktop and choose how the permission prompt is
// answered. Headless Chromium has no notification center of its own.
export const stubDesktopNotifications = async (
  page: Page,
  answer: NotificationPermission = "granted",
): Promise<void> => {
  await page.addInitScript((permissionAnswer) => {
    window.shownNotifications = [];
    class StubNotification {
      static permission: NotificationPermission = "default";
      static requestPermission = async () => {
        StubNotification.permission = permissionAnswer;

        return permissionAnswer;
      };
      onclick: (() => void) | null = null;
      constructor(title: string, options: NotificationOptions = {}) {
        window.shownNotifications.push({
          title,
          body: options.body,
          tag: options.tag,
        });
      }
      close() {}
    }
    Object.defineProperty(window, "Notification", {
      value: StubNotification,
      configurable: true,
    });
  }, answer);
};

export const shownNotifications = (page: Page): Promise<ShownNotification[]> =>
  page.evaluate(() => window.shownNotifications);
