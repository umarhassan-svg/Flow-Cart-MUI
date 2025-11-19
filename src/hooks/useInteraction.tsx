// src/hooks/useIntersection.ts
import { useEffect, useRef, useState } from "react";

export function useIntersection<T extends Element>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIntersecting(true);
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, options]);

  return { ref, isIntersecting };
}
