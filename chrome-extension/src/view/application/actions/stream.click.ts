import { setLast } from "./messages";

export const getStreamClickAction = (click: string): any => {
    switch (click) {
        case 'flowSetLast': return setLast;
        default: {
            console.log(`Unknown click action: ${click}`);
            return null;
        }
    }
};
