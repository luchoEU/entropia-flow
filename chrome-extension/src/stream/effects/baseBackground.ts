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

    private resizeObserver: ResizeObserver
    protected setReady(): void {
        this.ready = true

        this.callOnContainerResize();
        this.resizeObserver = new ResizeObserver(function() {
            this.callOnContainerResize()
        }.bind(this));
        this.resizeObserver.observe(this.container);
    }

    public render(delta?: number): void { }

    private callOnContainerResize() {
        const e = this.container as HTMLDivElement;
        if (e?.isConnected && e.style.width && e.style.height) {
            const scaleMatch = e.style.transform?.match(/scale\((.*?)\)/);
            const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
            this.onContainerResize(parseFloat(e.style.width) / scale, parseFloat(e.style.height) / scale);
            this.render();
        }
    }

    protected onContainerResize(width: number, height: number) { }

    public cleanUp() {
        this.resizeObserver?.disconnect()
    }
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
        super.cleanUp();
        const canvas = this.container.querySelector('canvas');
        if (canvas)
            this.container.removeChild(canvas);
    }
}

class CssBackground extends BaseBackground {
    private containerClassName: string
    private styleId: string

    constructor(container: HTMLElement, quantity?: number, name?: string) {
        super(container, false)
        if (name)
            this.init(quantity, name)
    }

    protected init(quantity: number, name: string) {
        this.containerClassName = `${this.container.id}-${name}-container`
        this.styleId = `${this.container.id}-${name}-style`
        this.addContainer(quantity)
        this.addStyle()
        this.setReady()
    }

    private addContainer(quantity: number) {
        if (this.container.getElementsByClassName(this.containerClassName)[0]) return

        const animationContainer: HTMLDivElement = document.createElement('div');
        animationContainer.classList.add(this.containerClassName)
        this.container.appendChild(animationContainer);

        const itemClassName = `${this.containerClassName}-item`
        for (let i = 1; i <= quantity; i++) {
            const div: HTMLDivElement = document.createElement('div');
            div.classList.add(itemClassName);
            animationContainer.appendChild(div);
        }
    }

    public override cleanUp(): void {
        super.cleanUp();
        const animationContainer = this.container.getElementsByClassName(this.containerClassName)[0]
        if (animationContainer)
            this.container.removeChild(animationContainer)

        this.removeStyleElement(this.styleId)
        this.removeStyleElement(`${this.styleId}-resize`)
    }

    private createStyleElement(styleId: string) {
        const root = this.container.getRootNode() as Document | ShadowRoot;
        let style = root.getElementById(styleId) as HTMLStyleElement
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            this.container.appendChild(style);
        }
        return style
    }

    private removeStyleElement(styleId: string) {
        const root = this.container.getRootNode() as Document | ShadowRoot;
        if (!root?.isConnected) return

        let style = root.getElementById(styleId) as HTMLStyleElement
        if (style) {
            this.container.removeChild(style);
        }
    }

    protected onContainerResize(width: number, height: number) {
        const style = this.createStyleElement(`${this.styleId}-resize`)
        style.innerHTML = `
            .${this.containerClassName} {
                width: ${width}px;
                height: ${height}px;
            }`
    }

    private addStyle() {
        const itemClassName = `${this.containerClassName}-item`
        const style = this.createStyleElement(this.styleId);
        style.innerHTML = `
            .${this.containerClassName} {
                position: relative;
                overflow: hidden;
            }
            .${itemClassName} {
                position: absolute;
            }
            ${this.getStyle(this.containerClassName, itemClassName)}`;
    }

    protected getStyle(containerClassName: string, itemClassName: string): string {
        return '';
    }
}

class SolidBackground extends CssBackground {
    private background: string
    constructor(container: HTMLElement, background: string) {
        super(container);
        this.background = background;
        this.init(0, 'solid');
    }

    protected override getStyle(containerClassName: string, itemClassName: string): string {
        return `
            .${containerClassName} {
                background-color: ${this.background};
            }`;
    }
}

export {
    IBackground,
    SimpleBackground,
    AnimatedBackground,
    CssBackground,
    SolidBackground,
}