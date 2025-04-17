
import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(name: string, props: any) {
    const previousProps = useRef(props);
    useEffect(() => {
        const allKeys = Object.keys({ ...previousProps.current, ...props });
        const changes = allKeys.reduce((acc, key) => {
            if (previousProps.current[key] !== props[key]) {
                acc[key] = {
                    from: previousProps.current[key],
                    to: props[key],
                };
            }
            return acc;
        }, {});
        if (Object.keys(changes).length > 0) {
            console.log(`[why-did-you-update] ${name}`, changes);
        }
        previousProps.current = props;
    });
}
