import { STORE_INIT, STORE_WINDOW } from "./const";
import { sendMessage } from "./messages";
import { interpolate } from "./utils";

const usedLayouts: string[] = [];

function sendUsedLayouts() {
    sendMessage("used-layouts", { usedLayouts: Array.from(new Set(usedLayouts)) });
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

async function openGameWindow(initData?: WindowData) {
    const w = await Neutralino.window.create('/streamView.html', {
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
    const pid = (w as any).pid;
    if (initData) {
        await Neutralino.storage.setData(interpolate(STORE_INIT, pid), JSON.stringify(initData));
    }
    const intervalId = window.setInterval(async () => {
        try {
            const data = await Neutralino.storage.getData(interpolate(STORE_WINDOW, pid));
            const parsed: WindowData = JSON.parse(data);
            usedLayouts.push(parsed.layoutId);
            sendUsedLayouts();
            window.clearInterval(intervalId);
        } catch {}
    }, 100);

    const keyStart = interpolate(STORE_WINDOW, '');
    window.setInterval(async () => {
        try {
            const winKeys = await Neutralino.storage.getKeys();
            winKeys.filter(key => key.startsWith(keyStart))
                .forEach(async key => {
                    const data = await Neutralino.storage.getData(key);
                    const parsed: WindowData = JSON.parse(data);
                    if (Date.now() - parsed.time > 60000) {
                        await Neutralino.storage.setData(key, null!);
                        usedLayouts.splice(usedLayouts.indexOf(parsed.layoutId), 1);
                        sendUsedLayouts();
                        return null;
                    }
                });
        } catch {}
    }, 60000); // garbage collect old windows every 60 seconds
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

async function openLastGameWindows() {
    const keyStart = interpolate(STORE_WINDOW, '');
    const winKeys = await Neutralino.storage.getKeys();
    const windowData = (await Promise.all(winKeys.filter(key => key.startsWith(keyStart))
        .map(async key => {
            const data = await Neutralino.storage.getData(key);
            await Neutralino.storage.setData(key, null!);
            const parsed: WindowData = JSON.parse(data);
            return parsed;
        })))
        .sort((a, b) => a.time - b.time);

    if (windowData.length === 0) {
        openGameWindow();
    } else {
        windowData.filter(data => data.time > windowData[0].time - 60000).forEach(data => { // open last 60 seconds, they update every 40 seconds
            openGameWindow(data);
        });
    }
}

export {
    openGameWindow,
    openSettingsWindow,
    openLastGameWindows,
    WindowData
}