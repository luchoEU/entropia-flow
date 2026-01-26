import { getDefaultStore } from "jotai";
import { createNewSessionAtom } from "../atoms/activity";

export const executeStreamClickAction = (click: string) => {
    switch (click) {
        case 'flowSetLast': 
            getDefaultStore().set(createNewSessionAtom)
            break;
        default: {
            console.log(`Unknown click action: ${click}`);
            break;
        }
    }
};
