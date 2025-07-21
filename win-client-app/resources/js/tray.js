/*
    Function to display information about the Neutralino app.
    This function updates the content of the 'info' element in the HTML
    with details regarding the running Neutralino application, including
    its ID, port, operating system, and version information.
*/
function showInfo() {
    document.getElementById('info').innerHTML = `
        ${NL_APPID} is running on port ${NL_PORT} inside ${NL_OS}
        <br/><br/>
        <span>server: v${NL_VERSION} . client: v${NL_CVERSION}</span>
        `;
}

/*
    Function to set up a system tray menu with options specific to the window mode.
    This function checks if the application is running in window mode, and if so,
    it defines the tray menu items and sets up the tray accordingly.
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
            {id: "NEW", text: "Create New Window"},
            {id: "SETTINGS", text: "Open Settings"},
            {id: "SHORTCUT", text: "Create Desktop Shortcut"},
            {id: "VERSION", text: "Show Client Version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit Application"}
        ]
    };

    // Set the tray menu
    Neutralino.os.setTray(tray);
}

/*
    Function to handle click events on the tray menu items.
    This function performs different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
*/
function onTrayMenuItemClicked(event) {
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
            exitApplication();
            break;
    }
}

async function createDesktopShortcut() {
    const desktopPath = await Neutralino.os.getEnv('USERPROFILE') + '\\Desktop';
    const shortcutPath = `${desktopPath}\\Entropia Flow Client.lnk`;

    const currPath = NL_CWD.replace(/\//g, '\\');
    const appPath = `${currPath}\\${NL_DATAPATH}\\${CLIENT_EXE}`;

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
    await Neutralino.os.execCommand(command);    
    await Neutralino.os.showMessageBox("Shortcut created", "Shortcut created successfully");
}

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
setTray();
