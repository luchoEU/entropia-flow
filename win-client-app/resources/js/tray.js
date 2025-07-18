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
            {id: "NEW", text: "New window"},
            {id: "SETTINGS", text: "Settings"},
            {id: "VERSION", text: "Get version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
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
        case "VERSION":
            Neutralino.os.showMessageBox("About", `Entropia Flow Client version ${clientVersion}\nAuthor: Lucho MUCHO Ireton\nYear: 2025`);
            break;
        case "QUIT":
            exitApplication();
            break;
    }
}

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
setTray();
