import { useEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        const updateSize = () => {
            if (ref.current) {
                setSize({
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight,
                });
            }
        };        
        updateSize();
        
        const observer = new ResizeObserver(updateSize);
        if (ref.current) observer.observe(ref.current);
        
        return () => observer.disconnect();
    }, []);
    
    return { ref, size };
}
