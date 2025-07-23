import { receiveUpdates } from "./messages";
import { Mouse } from "./mouse";
import { screensChanged } from "./position";
import { streamChanged, settingsChanged } from "./render";

Neutralino.init();
Neutralino.events.on('ready', () => {
    receiveUpdates('stream', 100, streamChanged);
    receiveUpdates('screens', 5000, screensChanged);
    receiveUpdates('settings', 5000, settingsChanged);
});
Mouse.init();
