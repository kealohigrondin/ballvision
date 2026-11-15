import { useCallback, useEffect, useRef, useState } from "react";

import { copy } from "@/copy";

import { desktopAlert } from "./desktopAlert";
import {
  createBrowserNotifier,
  type DesktopNotifier,
  type DesktopPermission,
  pageInBackground,
} from "./desktopNotifier";
import type { ScoreNotification } from "./scoreNotifications";

const STORAGE_KEY = "ballvision-desktop-alerts";

const readEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
};

const writeEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Private windows may refuse storage; the choice lasts for this visit.
  }
};

const browserNotifier = createBrowserNotifier();

/**
 * Sends each new score alert to the operating system's notification center
 * while ballvision is in a background tab or another window has focus. In
 * the foreground the score dialog shows instead.
 */
export const useDesktopNotifications = (
  alerts: readonly ScoreNotification[],
  notifier: DesktopNotifier = browserNotifier,
) => {
  const [permission, setPermission] = useState<DesktopPermission>(() =>
    notifier.permission(),
  );
  const [chosen, setChosen] = useState(readEnabled);
  const enabled = notifier.supported && chosen && permission === "granted";
  const sent = useRef(new Set<string>());

  useEffect(() => {
    for (const alert of alerts) {
      if (sent.current.has(alert.id)) {
        continue;
      }
      sent.current.add(alert.id);
      if (enabled && !alert.preview && pageInBackground()) {
        notifier.show(desktopAlert(alert), () => window.focus());
      }
    }
  }, [alerts, enabled, notifier]);

  const toggle = useCallback(async () => {
    if (enabled) {
      setChosen(false);
      writeEnabled(false);

      return;
    }
    const granted =
      notifier.permission() === "granted"
        ? "granted"
        : await notifier.requestPermission();
    setPermission(granted);
    if (granted !== "granted") {
      return;
    }
    setChosen(true);
    writeEnabled(true);
    // Confirms the alerts reach the desktop, and doubles as a test.
    notifier.show(
      {
        title: copy.scoreNotification.desktopReadyTitle,
        body: copy.scoreNotification.desktopReadyBody,
        tag: "ballvision-desktop-ready",
      },
      () => window.focus(),
    );
  }, [enabled, notifier]);

  return {
    desktopSupported: notifier.supported,
    desktopEnabled: enabled,
    desktopBlocked: permission === "denied",
    toggleDesktopAlerts: toggle,
  };
};
