'use client';
import { useEffect, useState, useRef, RefObject } from 'react';

interface UseInViewOptions {
  once?: boolean;
  amount?: number;
  threshold?: number;
}

export function useInView<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);
  const hasTriggered = useRef(false);

  // Unpack values to primitive dependencies to avoid object reference shifts on every render
  const once = options.once ?? false;
  const amount = options.amount ?? options.threshold ?? 0.2;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (once && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            hasTriggered.current = true;
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold: amount,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, once, amount]); // <-- Primitives referenced safely

  return isInView;
}