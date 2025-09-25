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
        if (div && btn) {
            if (isMonitoring) {
                btn.innerText = "Entropia Flow - Automatic Refresh enabled"
                div.className = "stop"
            } else {
                btn.innerText = "Entropia Flow - Automatic Refresh disabled"
                div.className = "start"
            }
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
        const nextRequest = options.itemsLoadedTime + options.currentWaitSeconds * 1000
        if (div) {
            div.title = `Click icon to open extension. Items loaded ${pad(now - options.itemsLoadedTime)} ago, ` +
                (options.itemsLoadingTime ? `new request started ${pad(now - options.itemsLoadingTime)} ago` :
                (options.isMonitoring ? 'updates' : 'safe to refresh') +
                (nextRequest > now ? ` in ${pad(nextRequest - now)}` : ' now'));
        }
    }

    private addDiv() {
        let style = document.createElement('style');
        style.innerHTML = `
            body
            {
                display: flex;
                flex-direction: column;
            }
            #EntropiaFlowExtension
            {
                display: flex;
                align-items: center;
                justify-content: center;
                background: darkblue;
                padding: 5px 10px;
                order: -1;
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
            <button id='EntropiaFlowButton'>Connecting to Entropia Flow extension...</button>`;        
        document.body.appendChild(div);
        const icon = document.getElementById('EntropiaFlowIcon')
        if (icon) {
            icon.addEventListener('click', () => this.showView())
        }
        const btn = document.getElementById('EntropiaFlowButton')
        if (btn) {
            btn.addEventListener('click', () => this.toggleIsMonitoring())
        }
    }
}

export default ContentUI