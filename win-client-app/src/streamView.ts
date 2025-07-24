import { STORE_SCREENS, STORE_SETTINGS, STORE_STREAM } from "./const";
import { receiveUpdates } from "./messages";
import { Mouse } from "./mouse";
import { screensChanged } from "./position";
import { streamChanged, settingsChanged } from "./render";

Neutralino.init();
Neutralino.events.on('ready', () => {
    receiveUpdates(STORE_STREAM, 100, streamChanged);
    receiveUpdates(STORE_SCREENS, 5000, screensChanged);
    receiveUpdates(STORE_SETTINGS, 5000, settingsChanged);
});
Mouse.init();
