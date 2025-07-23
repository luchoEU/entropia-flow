// use storage for communication since Neutralino.events.broadcast does not work

async function getInitializationData() {
    const key = `init-${NL_PID}`;
    const d = await Neutralino.storage.getData(key);
    await Neutralino.storage.setData(key, null!);
    return d ? JSON.parse(d) : null;
}

function receiveUpdates(key: string, interval: number, callback: (data: any) => void) {
    let ver: string | null = null;
    setInterval(async () => {
        try {
            const newVer = await Neutralino.storage.getData(`${key}Ver`);
            if (ver !== newVer) {
                const data = await Neutralino.storage.getData(key);
                callback(JSON.parse(data));
                console.log(`Received update for ${key}: ${data}`);
                ver = newVer ?? null;
            }
        } catch {
            console.log(`Failed to load update for ${key}`);
        }
    }, interval);
}

function sendMessage(type: string, payload: any, to: string = 'chrome-extension') {
    Neutralino.storage.setData('message', JSON.stringify({ type, payload, to }));
    console.log(`Sent message ${type} to ${to}:`, payload);
}

export {
    getInitializationData,
    receiveUpdates,
    sendMessage
}
