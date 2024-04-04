class ContentUI {
    public isMonitoring = false
    private showView: () => void
    private setIsMonitoring: (isMonitoring: boolean) => void

    constructor(showView: () => void, setIsMonitoring: (isMonitoring: boolean) => void) {
        this.showView = showView
        this.setIsMonitoring = setIsMonitoring
        this.addDiv()
    }

    public refresh() {
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
                background-color: #4CAF50;
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
            <button id='EntropiaFlowButton'>Connecting...</button>`;
        document.body.appendChild(div);
        const icon = document.getElementById('EntropiaFlowIcon')
        icon.addEventListener('click', () => this.showView())
        const btn = document.getElementById('EntropiaFlowButton')
        btn.addEventListener('click', () => this.setIsMonitoring(!this.isMonitoring))
    }
}

export default ContentUI