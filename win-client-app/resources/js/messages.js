// use storage for communication since Neutralino.events.broadcast does not work

async function getInitializationData() {
    const key = `init-${NL_PID}`;
    const d = await Neutralino.storage.getData(key);
    await Neutralino.storage.setData(key, null);
    return d ? JSON.parse(d) : null;
}

function receiveUpdates(key, interval, callback) {
    let ver = undefined
    setInterval(async () => {
        try {
            const newVer = await Neutralino.storage.getData(`${key}Ver`);
            if (ver !== newVer) {
                const data = await Neutralino.storage.getData(key);
                callback(JSON.parse(data));
                console.log(`Received update for ${key}: ${data}`);
                ver = newVer;
            }
        } catch {
            console.log(`Failed to load update for ${key}`);
        }
    }, interval);
}

function sendMessage(type, payload, to = 'chrome-extension') {
    Neutralino.storage.setData('message', JSON.stringify({ type, data: payload, to }));
    console.log(`Sent message ${type} to ${to}:`, payload);
}
