import { STORE_WINDOW } from "./const";
import { sendInitMessageToWindow } from "./messages";
import { sendMessageToRelay } from "./socket";
import { interpolate } from "./utils";

const usedLayouts: Record<number, string> = {};

function sendUsedLayouts() {
    sendMessageToRelay("used-layouts", Array.from(new Set(Object.values(usedLayouts))));
}

type WindowData = {
    layoutId: string;
    minimized: boolean;
    time: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

async function layoutChanged(pid: number, layoutId: string) {
    usedLayouts[pid] = layoutId;
    sendUsedLayouts();
}

async function openGameWindow() {
    await Neutralino.window.create('/streamView.html', {
        title: 'Entropia Flow Client',
        icon: '/resources/img/appIcon.png',
        minWidth: 30,
        minHeight: 30,
        center: true,
        alwaysOnTop: true,
        transparent: true,
        borderless: true,
        hidden: false,
        exitProcessOnClose: true,
    } as any); // use any since the definition is wrong in center, x, y
}

async function openSettingsWindow() {
    await Neutralino.window.create('/settings.html', {
        title: 'Entropia Flow Client Settings',
        icon: '/resources/img/appIcon.png',
        width: 700,
        height: 370,
        minWidth: 200,
        minHeight: 100,
        center: true,
        hidden: false,
        exitProcessOnClose: true,
    } as any); // use any since the definition is wrong in center, x, y
}

let _initWindowData: WindowData[] = [];
async function identifyWindow(pid: number) {
    const initData = _initWindowData.pop();
    sendInitMessageToWindow(pid, initData);
}

async function openLastGameWindows() {
    // restore windows from last time
    const storeWindowKeyStart = interpolate(STORE_WINDOW, '');
    const winKeys = await Neutralino.storage.getKeys();
    _initWindowData = (await Promise.all(winKeys.filter(key => key.startsWith(storeWindowKeyStart))
        .map(async key => {
            const data = await Neutralino.storage.getData(key);
            await Neutralino.storage.setData(key, null!);
            const parsed: WindowData = JSON.parse(data);
            return parsed;
        })))
        .sort((a, b) => a.time - b.time);

    if (_initWindowData.length > 0) {
        // open last 60 seconds, they send keep alive every 40 seconds
        _initWindowData = _initWindowData.filter(d => d.time > _initWindowData[0].time - 60000);
    }
    if (_initWindowData.length === 0) {
        openGameWindow();
    } else {
        _initWindowData.forEach(d => {
            openGameWindow();
        });
    }

    // garbage collect old windows every 60 seconds
    window.setInterval(async () => {
        try {
            const winKeys = await Neutralino.storage.getKeys();
            winKeys.filter(key => key.startsWith(storeWindowKeyStart))
                .forEach(async key => {
                    const data = await Neutralino.storage.getData(key);
                    const parsed: WindowData = JSON.parse(data);
                    if (Date.now() - parsed.time > 60000) {
                        await Neutralino.storage.setData(key, null!);
                        const pid = parseInt(key.split('-')[1]);
                        delete usedLayouts[pid];
                        sendUsedLayouts();
                        return null;
                    }
                });
        } catch {} // fails when there are no keys
    }, 60000);
}

export {
    openGameWindow,
    openSettingsWindow,
    openLastGameWindows,
    sendUsedLayouts,
    identifyWindow,
    layoutChanged,
    WindowData
}