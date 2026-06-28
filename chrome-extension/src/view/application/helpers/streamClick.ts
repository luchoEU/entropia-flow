import { getDefaultStore } from "jotai";
import { createNewSessionAtom } from "../atoms/activity";
import messagesApi from "../../services/api/messages";

export const executeStreamClickAction = (click: string) => {
    if (click.startsWith('set:')) {
        const remainder = click.slice(4);
        const parts = remainder.split(/[;&]/);
        const updates: Record<string, any> = {};
        for (const part of parts) {
            let cleanPart = part.trim();
            if (cleanPart.startsWith('set:')) {
                cleanPart = cleanPart.slice(4);
            }
            const index = cleanPart.indexOf('=');
            if (index !== -1) {
                const k = cleanPart.slice(0, index).trim();
                const v = cleanPart.slice(index + 1).trim();
                updates[k] = v;
            }
        }
        messagesApi.changeLayoutState(updates)
        return
    }
    if (click.startsWith('copy:')) {
        const text = click.slice(5);
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy text to clipboard:', err);
        });
        return;
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
