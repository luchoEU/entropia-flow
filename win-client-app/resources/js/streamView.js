Neutralino.init();

// use storage for communication since Neutralino.events.broadcast does not work
Neutralino.events.on('ready', () => {
    let streamVer = undefined
    setInterval(async () => {
        const newVer = await Neutralino.storage.getData('streamVer');
        if (streamVer != newVer) {
            streamVer = newVer;
            const stream = await Neutralino.storage.getData('stream');
            const data = JSON.parse(stream);
            if (data.kill) {
                Neutralino.app.exit();
            } else {
                streamChanged(data);
            }
        }
    }, 100);

    let screensVer = undefined;
    setInterval(async () => {
        const newVer = await Neutralino.storage.getData('screensVer');
        if (screensVer !== newVer) {
            screensVer = newVer;
            const screens = await Neutralino.storage.getData('screens');
            screensChanged(JSON.parse(screens));
        }
    }, 5000);
});
