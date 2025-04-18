import { DependencyList, useEffect, useRef } from 'react';
import loadBackground, { BackgroundType } from '../../../stream/background'
import { StreamRenderSize } from '../../../stream/data';

const defaultDeps: DependencyList = []; // use a constant so it is always the same empty array

const useBackground = (
    type: BackgroundType,
    containerId: string,
    root: ShadowRoot | Document = document,
    size: StreamRenderSize | undefined,
    deps: DependencyList = defaultDeps
) => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!size) return; // Wait for size to be defined

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
            const container = root?.getElementById(containerId);
            if (container && observerRef.current) {
                observerRef.current.unobserve(container);
                observerRef.current.disconnect();
            }
            // Remove background when container is no longer visible
            if (container) {
                clearBackground();
            }
        };
    }, [ ...deps, type, containerId, root, size?.width, size?.height ]); // size is an object, so we need to depend on its properties
}

export default useBackground
