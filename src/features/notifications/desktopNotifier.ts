/** Whether the browser lets this page show desktop notifications. */
export type DesktopPermission = "default" | "granted" | "denied";

export type DesktopAlert = {
  title: string;
  body: string;
  /** Image shown beside the text, e.g. the scoring team's logo. */
  icon?: string;
  /** Alerts with the same tag replace each other, e.g. one per game. */
  tag: string;
};

/** Shows system notifications: Windows, macOS and Linux desktop alerts. */
export interface DesktopNotifier {
  /** False where the browser has no notifications, e.g. iOS Safari tabs. */
  supported: boolean;
  permission(): DesktopPermission;
  requestPermission(): Promise<DesktopPermission>;
  show(alert: DesktopAlert, onClick: () => void): void;
}

// The browser's Notification API. Chrome, Edge, Firefox and Safari hand these
// to the operating system's notification center on every desktop platform.
export const createBrowserNotifier = (): DesktopNotifier => {
  const supported = typeof window !== "undefined" && "Notification" in window;

  return {
    supported,
    permission: () => (supported ? Notification.permission : "denied"),
    requestPermission: async (): Promise<DesktopPermission> =>
      supported ? Notification.requestPermission() : "denied",
    show: ({ title, ...options }, onClick) => {
      if (!supported) {
        return;
      }
      const notification = new Notification(title, options);
      notification.onclick = () => {
        onClick();
        notification.close();
      };
    },
  };
};

/** True when the page is in a background tab or another window has focus. */
export const pageInBackground = (doc: Document = document): boolean =>
  doc.visibilityState === "hidden" || !doc.hasFocus();
