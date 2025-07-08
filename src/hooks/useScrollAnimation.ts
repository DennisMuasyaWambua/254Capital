import { useEffect, useState, useRef } from 'react';

interface ScrollAnimationResult {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  hasAnimated: boolean;
}

export const useScrollAnimation = (options = {}): ScrollAnimationResult => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Default options
  const defaultOptions = {
    threshold: 0.15,  // Element is considered visible when 15% of it is in viewport
    rootMargin: '0px 0px -100px 0px',  // Start observing before element enters viewport
    once: true,  // Only animate once by default
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when element enters viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // If animation should only happen once and element has entered viewport
          if (mergedOptions.once) {
            setHasAnimated(true);
            // Stop observing after animation has occurred
            const currentRef = ref.current;
            if (currentRef) {
              observer.unobserve(currentRef);
            }
          }
        } else if (!mergedOptions.once) {
          // If not set to animate once, toggle visibility state
          setIsVisible(false);
        }
      },
      {
        threshold: mergedOptions.threshold,
        rootMargin: mergedOptions.rootMargin
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [mergedOptions.once, mergedOptions.threshold, mergedOptions.rootMargin]);

  return { ref, isVisible, hasAnimated };
};
