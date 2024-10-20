import { useEffect, useRef } from 'react';
import { BackgroundType, loadBackground } from '../../../stream/background'

const useBackground = (type: BackgroundType, containerId: string) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);

    if (container) {
      // Initialize background when container is visible
      loadBackground(type, container, undefined);

      // Create an intersection observer to track container visibility
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Call the initializer (setup) when the container becomes visible
              loadBackground(type, container, undefined);
            } else {
              // Call the destructor (cleanup) when the container is no longer visible
              loadBackground(undefined, container, undefined);
            }
          });
        },
        { threshold: 0 } // Trigger when container is fully out of the viewport
      );

      // Start observing the container
      observerRef.current.observe(container);
    }

    // Cleanup on component unmount
    return () => {
      const container = document.getElementById(containerId);
      if (container && observerRef.current) {
        observerRef.current.unobserve(container);
        observerRef.current.disconnect();
      }
      // Remove background when container is no longer visible
      if (container) {
        loadBackground(undefined, container, undefined);
      }
    };
  }, [ type, containerId ]);
}

export default useBackground