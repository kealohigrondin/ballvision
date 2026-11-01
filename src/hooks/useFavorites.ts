import { useState } from "react";
const KEY = "saturday:favorites:v1";
export const useFavorites = () => {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      return Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  });
  const toggle = (id: string) => {
    setIds((current) => {
      const next = current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* Storage is optional. */
      }
      return next;
    });
  };
  return { ids, toggle };
};
