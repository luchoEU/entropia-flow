import { Socket } from "./socket";
import { openGameWindow } from "./windows";
import { Tray } from "./tray";

Neutralino.init();
Socket.init();
Tray.init();
openGameWindow();
