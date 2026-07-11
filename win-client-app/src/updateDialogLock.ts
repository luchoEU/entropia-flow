import { STORE_UPDATE_DIALOG_LOCK } from "./const";

type UpdateDialogLock = {
    owner: string;
    acquiredAt: number;
    expiresAt: number;
};

const UPDATE_DIALOG_LOCK_TTL_MS = 5 * 60 * 1000;
const UPDATE_DIALOG_SESSION_STARTED_AT = Date.now();

function parseUpdateDialogLock(data: string | null | undefined): UpdateDialogLock | null {
    if (!data) return null;
    try {
        return JSON.parse(data) as UpdateDialogLock;
    } catch {
        return null;
    }
}

async function tryAcquireUpdateDialogLock(): Promise<string | null> {
    const now = Date.now();
    const current = parseUpdateDialogLock(await Neutralino.storage.getData(STORE_UPDATE_DIALOG_LOCK));
    if (current && current.expiresAt > now && current.acquiredAt >= UPDATE_DIALOG_SESSION_STARTED_AT) {
        return null;
    }

    const owner = `${now}-${Math.random().toString(16).slice(2)}`;
    const lock: UpdateDialogLock = {
        owner,
        acquiredAt: now,
        expiresAt: now + UPDATE_DIALOG_LOCK_TTL_MS,
    };
    await Neutralino.storage.setData(STORE_UPDATE_DIALOG_LOCK, JSON.stringify(lock));

    const stored = parseUpdateDialogLock(await Neutralino.storage.getData(STORE_UPDATE_DIALOG_LOCK));
    if (stored?.owner !== owner) {
        return null;
    }

    return owner;
}

async function releaseUpdateDialogLock(owner: string): Promise<void> {
    const stored = parseUpdateDialogLock(await Neutralino.storage.getData(STORE_UPDATE_DIALOG_LOCK));
    if (stored?.owner === owner) {
        await Neutralino.storage.setData(STORE_UPDATE_DIALOG_LOCK, null!);
    }
}

export {
    tryAcquireUpdateDialogLock,
    releaseUpdateDialogLock,
}
