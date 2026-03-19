import { getDefaultStore } from "jotai";
import { createNewSessionAtom } from "../atoms/activity";
import messagesApi from "../../services/api/messages";

export const executeStreamClickAction = (click: string) => {
    if (click.startsWith('set:')) {
        const [key, value] = click.slice(4).split('=');
        messagesApi.changeLayoutState(key, value)
        return
    }
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
