import { Socket } from "./socket";
import { Tray } from "./tray";
import { openLastGameWindows } from "./windows";

Neutralino.init();
Socket.init();
Tray.init();
openLastGameWindows();
