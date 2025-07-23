async function openGameWindow() {
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
    //await Neutralino.storage.setData(`init-${w.pid}`, await getInitData());
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

export {
    openGameWindow,
    openSettingsWindow
}