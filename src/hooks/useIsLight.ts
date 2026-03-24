import { useState, useEffect } from "react";

/**
 * Reactive hook that returns `true` when the app is in light mode.
 * Listens for class-list changes on `<html>` via MutationObserver.
 */
export function useIsLight(): boolean {
  const [isLight, setIsLight] = useState(() =>
    document.documentElement.classList.contains("light")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isLight;
}
