// Renders and handles the UI in Entropia Universe website

class ContentUI {
    public isMonitoring = false
    private showView: () => boolean
    private setIsMonitoring: (isMonitoring: boolean) => boolean

    constructor(showView: () => boolean, setIsMonitoring: (isMonitoring: boolean) => boolean) {
        this.showView = showView
        this.setIsMonitoring = setIsMonitoring
        this.addDiv()
    }

    public refreshButton() {
        const div = document.getElementById('EntropiaFlowExtension')
        const btn = document.getElementById('EntropiaFlowButton')
        if (this.isMonitoring) {
            btn.innerText = "Stop Automatic Refresh"
            div.className = "stop"
        } else {
            btn.innerText = "Start Automatic Refresh"
            div.className = "start"
        }
    }

    public refreshItemsLoadTime(loadedTime: number, loadingTime?: number) {
        const div = document.getElementById('EntropiaFlowExtension')

        const now = new Date().getTime()
        function pad(t: number) {
            const time = now - t;
            const hours = Math.floor(time / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((time % (1000 * 60)) / 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        div.title = `Click icon to open extension. Items loaded ${pad(loadedTime)} ago` + (loadingTime ? `, new request started ${pad(loadingTime)} ago` : '');
    }

    private getAvatarName(): string {
        let btnList = document.getElementsByTagName('button')
        for (let i = 0; i < btnList.length; i++) {
            if (btnList[i].innerHTML.trim() == 'Log Out') {
                const loginButton = btnList[i]
                const prev = loginButton.parentElement.previousSibling as HTMLElement
                return prev.innerText.replace('Avatar:', '').trim()
            }
        }
        return undefined
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
            <button id='EntropiaFlowButton'>Connecting to Entropia Flow extension...</button>`;
        document.body.appendChild(div);
        const icon = document.getElementById('EntropiaFlowIcon')
        icon.addEventListener('click', () => this.showView())
        const btn = document.getElementById('EntropiaFlowButton')
        btn.addEventListener('click', () => this.setIsMonitoring(!this.isMonitoring))
    }
}

export default ContentUI