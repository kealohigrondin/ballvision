import { useEffect, useRef, useState } from "react";

export const useElementWidth = () => {
  const ref = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(560);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
};
