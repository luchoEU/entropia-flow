// Renders and handles the UI in Entropia Universe website

import { ContentTimerOptions } from "./contentTimer"

class ContentUI {
    private showView: () => boolean
    private toggleIsMonitoring: () => void

    constructor(showView: () => boolean, toggleIsMonitoring: () => void) {
        this.showView = showView
        this.toggleIsMonitoring = toggleIsMonitoring
        this.addDiv()
    }

    public refreshButton(isMonitoring: boolean) {
        const div = document.getElementById('EntropiaFlowExtension')
        const btn = document.getElementById('EntropiaFlowButton')
        if (isMonitoring) {
            btn.innerText = "Stop Automatic Refresh"
            div.className = "stop"
        } else {
            btn.innerText = "Start Automatic Refresh"
            div.className = "start"
        }
    }

    public refreshItemsLoadTime(options: ContentTimerOptions) {
        const div = document.getElementById('EntropiaFlowExtension')

        function pad(time: number) {
            const hours = Math.floor(time / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((time % (1000 * 60)) / 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const now = new Date().getTime()
        const nextRequest = options.itemsLoadedTime + options.waitSeconds * 1000
        div.title = `Click icon to open extension. Items loaded ${pad(now - options.itemsLoadedTime)} ago, ` +
            (options.itemsLoadingTime ? `new request started ${pad(now - options.itemsLoadingTime)} ago` :
            (options.isMonitoring ? 'updates' : 'safe to refresh') +
            (nextRequest > now ? ` in ${pad(nextRequest - now)}` : ' now'));
    }

    private addDiv() {
        let style = document.createElement('style');
        style.innerHTML = `
            #EntropiaFlowExtension
            {
                position:fixed;
                top:10px;
                right:10px;
                background:darkblue;
                padding:5px 10px;
                border-style:none;
                border-radius:10px;
            }
            #EntropiaFlowExtension.start {
                background-color: green;
            }
            #EntropiaFlowExtension.stop {
                background-color: red;
            }
            #EntropiaFlowIcon
            {
                vertical-align: middle;
                height: 20px;
            }
            #EntropiaFlowButton
            {
                border-style: none;
                background-color: transparent;
                color: ghostwhite;
                vertical-align: middle;
            }`;
        document.head.appendChild(style);
        const div = document.createElement('div');
        div.id = 'EntropiaFlowExtension';
        div.innerHTML = `
            <img id='EntropiaFlowIcon' src='https://i.ibb.co/5RxzC2Y/flow128w.png'>
            <button id='EntropiaFlowButton'>${this.toggleIsMonitoring ? 'Connecting to Entropia Flow extension...' : 'Entropia Flow'}</button>`;
        document.body.appendChild(div);
        const icon = document.getElementById('EntropiaFlowIcon')
        icon.addEventListener('click', () => this.showView())
        const btn = document.getElementById('EntropiaFlowButton')
        btn.addEventListener('click', () => this.toggleIsMonitoring())
    }
}

export default ContentUI