async function openGameWindow() {
    const w = await Neutralino.window.create('/streamView.html', {
        title: 'Entropia Flow Client',
        minWidth: 30,
        minHeight: 30,
        icon: "/resources/img/appIcon.png",
        center: true,
        alwaysOnTop: true,
        transparent: true,
        borderless: true,
        hidden: false,
        exitProcessOnClose: true,
    });
    //await Neutralino.storage.setData(`init-${w.pid}`, await getInitData());
}

async function openSettingsWindow() {
    await Neutralino.window.create('/settings.html', {
        title: 'Entropia Flow Client Settings',
        icon: "/resources/img/appIcon.png",
        width: 700,
        height: 370,
        minWidth: 200,
        minHeight: 100,
        center: true,
        hidden: false,
        exitProcessOnClose: true,
    });
}
