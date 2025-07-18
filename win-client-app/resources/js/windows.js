async function openGameWindow() {
    await Neutralino.window.create('/streamView.html', {
        id: 'streamView',
        title: 'Entropia Flow Client',
        width: 250,
        height: 70,
        minWidth: 30,
        minHeight: 30,
        center: true,
        fullScreen: false,
        alwaysOnTop: false,
        icon: "/resources/img/appIcon.png",
        borderless: true,
        transparent: true,
        frameless: true,
        maximize: false,
        resizable: true,
        hidden: false,
    });
}

async function openSettingsWindow() {
    await Neutralino.window.create('/settings.html', {
        title: 'Settings',
        width: 500,
        height: 400
    });
}
