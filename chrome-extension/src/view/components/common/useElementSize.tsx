import { useCallback, useLayoutEffect, useEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
    // 1. Create a state to hold the DOM node
    const [ref, setRef] = useState<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const handleResize = useCallback(() => {
        if (ref) {
            setSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
            });
        }
    }, [ref]);

    useLayoutEffect(() => {
        // 2. Don't do anything if the ref is not set yet
        if (!ref) {
            return;
        }

        // 3. Run the resize handler once initially
        handleResize();

        // 4. Create the observer and attach it to the ref
        const observer = new ResizeObserver(handleResize);
        observer.observe(ref);

        // 5. Cleanup: disconnect the observer when the component unmounts
        // or when the ref changes to a new element.
        return () => {
            observer.disconnect();
        };
    }, [ref, handleResize]); // The effect now depends on the ref itself

    // 6. Return the `setRef` function as the ref.
    // React will call this function with the DOM node when it's mounted.
    return { ref: setRef, size };
}
