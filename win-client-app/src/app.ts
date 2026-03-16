import { Socket } from "./socket";
import { Tray } from "./tray";
import { Updater } from "./updater";
import { openLastGameWindows } from "./windows";

Neutralino.init();
Socket.init();
Tray.init();
Updater.init();
openLastGameWindows();
