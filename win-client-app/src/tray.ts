import { clientVersion } from "./const";
import { Socket } from "./socket";
import { CLIENT_EXE } from "./const";
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
            {id: "SHORTCUT", text: "Create Desktop Shortcut"},
            {id: "VERSION", text: "Version"},
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
        case "SHORTCUT":
            createDesktopShortcut();
            break;
        case "VERSION":
            Neutralino.os.showMessageBox("About", `Entropia Flow Client version ${clientVersion}\nCopyright © 2025 Lucho MUCHO Ireton`);
            break;
        case "QUIT":
            await Socket.exit();
            Neutralino.app.exit();
            break;
    }
}

async function createDesktopShortcut() {
    const desktopCommand = `powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`;
    const desktopResult = await Neutralino.os.execCommand(desktopCommand);
    const desktopPath = desktopResult.stdOut.trim();
    const shortcutPath = `${desktopPath}\\Entropia Flow Client.lnk`;

    const currPath = NL_CWD.replace(/\//g, '\\');
    const appPath = `${currPath}\\${CLIENT_EXE}`;

    const psScript = `
    $ws = New-Object -comObject WScript.Shell;
    $s = $ws.CreateShortcut("${shortcutPath}");
    $s.TargetPath = "${appPath}";
    $s.WorkingDirectory = "${currPath}";
    $s.WindowStyle = 1;
    $s.IconLocation = "${appPath},0";
    $s.Save()
    `
    const command = `powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, '').replace(/"/g, '\\"')}"`;
    console.log(command);
    const result = await Neutralino.os.execCommand(command);
    if (result.exitCode === 0) {
        console.log("Shortcut created successfully.");
        await Neutralino.os.showMessageBox("Shortcut created", "Shortcut created successfully");
    } else {
        console.error("Shortcut creation failed:", result.exitCode, result.stdErr);
        await Neutralino.os.showMessageBox("Shortcut creation failed", `Shortcut creation failed: ${result.exitCode}\n${result.stdErr}`);
    }
}

const Tray = {
    init: () => {
        setTray();
        Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    }
}
export { Tray }
