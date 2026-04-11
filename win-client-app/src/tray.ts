import { clientVersion } from "./const";
import { Socket } from "./socket";
import { Updater } from "./updater";
import { openGameWindow, openSettingsWindow } from "./windows";

/*
    Set up a system tray menu with options specific to the window mode.
*/
function setTray() {
    // Tray menu is only available in window mode
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }

    // Define tray menu items
    let tray = {
        icon: "/resources/img/appIcon.png",
        menuItems: [
            {id: "NEW", text: "New Window"},
            {id: "SETTINGS", text: "Settings"},
            {id: "VERSION", text: `Version (${clientVersion})`},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Exit"}
        ]
    };

    // Set the tray menu
    Neutralino.os.setTray(tray);
}

/*
    Handle click events on the tray menu items.
    Perform different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
*/
async function onTrayMenuItemClicked(event: any) {
    switch(event.detail.id) {
        case "SETTINGS":
            openSettingsWindow();
            break;
        case "NEW":
            openGameWindow();
            break;
        case "VERSION": {
            const result = await Neutralino.os.showMessageBox(
                "About",
                `Entropia Flow Client version ${clientVersion}\nCopyright \u00A9 2025-2026 Lucho MUCHO Ireton\n\nCheck for updates?`,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'INFO' as Neutralino.os.Icon
            );
            if (result === 'YES') {
                await handleCheckForUpdates();
            }
            break;
        }
        case "QUIT":
            await Socket.exit();
            Neutralino.app.exit();
            break;
    }
}

async function handleCheckForUpdates() {
    const status = await Updater.checkForUpdates();
    switch (status.type) {
        case 'resources': {
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                `A new version (${status.manifest.version}) is available. You are running ${clientVersion}.\n\nWould you like to update and restart now?`,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'QUESTION' as Neutralino.os.Icon
            );
            if (result === 'YES') {
                await Updater.installResourcesUpdate();
            }
            break;
        }
        case 'binary': {
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                `A new version (${status.manifest.version}) requires a full update (new executable/relay).\nYou are running ${clientVersion}.\n\nWould you like to open the download page?`,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'QUESTION' as Neutralino.os.Icon
            );
            if (result === 'YES') {
                await Neutralino.os.open(status.manifest.binaryURL);
            }
            break;
        }
        case 'error': {
            const result = await Neutralino.os.showMessageBox(
                'Update Check Failed',
                `Could not check for updates:\n${status.message}\n\nCopy error details to clipboard?`,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'ERROR' as Neutralino.os.Icon
            );
            if (result === 'YES') {
                await Neutralino.clipboard.writeText(status.message);
            }
            break;
        }
        case 'none':
            await Neutralino.os.showMessageBox('Up to Date', `You are running the latest version (${clientVersion}).`);
            break;
    }
}

const Tray = {
    init: () => {
        setTray();
        Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    }
}
export { Tray }
