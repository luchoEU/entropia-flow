import { STORE_INIT, STORE_SCREENS, STORE_SETTINGS, STORE_STREAM } from "./const";
import { receiveUpdates, sendMessageToMain } from "./messages";
import { Mouse } from "./mouse";
import { screensChanged } from "./position";
import { streamChanged, settingsChanged, setInitData } from "./render";
import { interpolate } from "./utils";
import { WindowData } from "./windows";

Neutralino.init();
const _intervalIds: ReturnType<typeof setInterval>[] = [];
Neutralino.events.on('ready', () => {
    _intervalIds.push(receiveUpdates(STORE_STREAM, 100, streamChanged));
    _intervalIds.push(receiveUpdates(STORE_SCREENS, 5000, screensChanged));
    _intervalIds.push(receiveUpdates(STORE_SETTINGS, 5000, settingsChanged));
});
Mouse.init();

window.addEventListener('beforeunload', () => {
    _intervalIds.forEach(id => clearInterval(id));
});

const initKey = interpolate(STORE_INIT, NL_PID);
sendMessageToMain('identify', { pid: NL_PID });
const initInterval = setInterval(async () => {
    try {
        const d = await Neutralino.storage.getData(initKey);
        await Neutralino.storage.setData(initKey, null!);
        console.log('Received init data:', d);
        clearInterval(initInterval);
        if (d.length > 0) {
            const initData: WindowData = JSON.parse(d);
            setInitData(initData);
        }
    } catch {} // wait until it is there
}, 100);
