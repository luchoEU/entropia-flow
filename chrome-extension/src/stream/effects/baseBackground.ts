interface IBackground {
    container: HTMLElement,
    ready: boolean,
    isAnimated: boolean,
    type?: number
    render(delta: number): void
    cleanUp(): void
}

class BaseBackground implements IBackground {
    public container: HTMLElement
    public ready: boolean
    public isAnimated: boolean
    public type?: number
    public constructor(container: HTMLElement, isAnimated: boolean) {
        this.container = container
        this.ready = false
        this.isAnimated = isAnimated
    }

    protected setReady(): void {
        this.ready = true

        this.onContainerResize();
        const that = this
        this.container.addEventListener('resize', () => that.onContainerResize, false);
    }

    public render(delta: number): void { }

    protected onContainerResize() { }

    public cleanUp() { }
}

class SimpleBackground extends BaseBackground {
    constructor(container: HTMLElement) {
        super(container, false)
        this.setReady()
    }
}

class AnimatedBackground extends BaseBackground {
    constructor(container: HTMLElement) {
        super(container, true)
    }

    public override cleanUp(): void {
        const canvas = this.container.querySelector('canvas')
        if (canvas)
          this.container.removeChild(canvas)
    }
}

class CssBackground extends BaseBackground {
    private containerClassName: string

    constructor(container: HTMLElement, quantity: number, name: string) {
        super(container, false)
        this.containerClassName = `${name}-container`
        this.addContainer(quantity, name)
        this.addStyle(name)
        this.setReady()
    }

    private addContainer(quantity: number, name: string) {
        if (this.container.getElementsByClassName(this.containerClassName)[0]) return

        const animationContainer: HTMLDivElement = document.createElement('div');
        animationContainer.classList.add(this.containerClassName)
        this.container.appendChild(animationContainer);

        for (let i = 1; i <= quantity; i++) {
            const div: HTMLDivElement = document.createElement('div');
            div.classList.add(name);
            animationContainer.appendChild(div);
        }
    }

    public override cleanUp(): void {
        const animationContainer = this.container.getElementsByClassName(this.containerClassName)[0]
        if (animationContainer)
          this.container.removeChild(animationContainer)
    }

    private addStyle(name: string) {
        const styleId = `${name}-style`
        if (document.getElementById(styleId)) return
        
        const style: HTMLStyleElement = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .${this.containerClassName} {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
            }
            .${name} {
                position: absolute;
            }
            ` + this.getStyle(this.containerClassName, name);
        document.head.appendChild(style);
    }

    protected getStyle(containerClassName: string, itemClassName: string): string {
        return '';
    }
}

export {
    IBackground,
    SimpleBackground,
    AnimatedBackground,
    CssBackground,
}