import { DependencyList, useEffect, useRef } from 'react';
import loadBackground, { BackgroundType } from '../../../stream/background'

const useBackground = (
    type: BackgroundType,
    containerId: string,
    root: ShadowRoot | Document = document,
    deps: DependencyList = []
) => {
        const observerRef = useRef<IntersectionObserver | null>(null);
        
        useEffect(() => {
            const container = root?.getElementById(containerId);
            const applyBackground = () => loadBackground(type, container, undefined);
            const clearBackground = () => loadBackground(undefined, container, undefined);

            if (container) {
                // Initialize background when container is visible
                applyBackground();
                
                // Create an intersection observer to track container visibility
                observerRef.current = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                // The container becomes visible
                                applyBackground();
                            } else {
                                // The container is no longer visible
                                clearBackground();
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
                    clearBackground();
                }
            };
        }, [ ...deps, type, containerId, root ]);
    }
    
    export default useBackground