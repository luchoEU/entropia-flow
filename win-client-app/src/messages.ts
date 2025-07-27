// use storage for communication since Neutralino.events.broadcast does not work

import { STORE_INIT, STORE_MESSAGE, STORE_VER } from "./const";
import { interpolate } from "./utils";

function receiveUpdates(key: string, interval: number, callback: (data: any) => void) {
    let ver: string | null = null;
    setInterval(async () => {
        try {
            const newVer = await Neutralino.storage.getData(interpolate(STORE_VER, key));
            if (ver !== newVer) {
                const data = await Neutralino.storage.getData(key);
                callback(JSON.parse(data));
                console.log(`Received update for ${key}: ${data}`);
                ver = newVer ?? null;
            }
        } catch {
            console.log(`Failed to load update for ${key}`);
        }
    }, interval);
}

function sendMessageToMain(type: string, payload: any, to: string = 'entropia-flow-client') {
    Neutralino.storage.setData(interpolate(STORE_MESSAGE, Math.floor(Math.random() * 1000000).toString()), JSON.stringify({ type, payload, to }));
    console.log(`Sent message ${type} to ${to}:`, payload);
}

function sendInitMessageToWindow(pid: number, payload?: any) {
    Neutralino.storage.setData(interpolate(STORE_INIT, pid.toString()), payload ? JSON.stringify(payload) : '');
    console.log(`Sent init message to window ${pid}:`, payload);
}

export {
    receiveUpdates,
    sendMessageToMain,
    sendInitMessageToWindow
}
