import { STORE_UPDATE_PROGRESS } from "./const";

Neutralino.init();

Neutralino.events.on('ready', () => {
    let _lastData = '';
    setInterval(async () => {
        try {
            const data = await Neutralino.storage.getData(STORE_UPDATE_PROGRESS);
            if (data === _lastData) return;
            _lastData = data;
            const { pct, status } = JSON.parse(data);
            const bar = document.getElementById('bar') as HTMLElement;
            const statusEl = document.getElementById('status') as HTMLElement;
            if (bar) bar.style.width = `${pct}%`;
            if (statusEl) statusEl.textContent = status;
        } catch {}
    }, 300);
});
