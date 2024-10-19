interface IBackground {
    container: HTMLElement,
    ready: boolean,
    isAnimated: boolean,
    type?: number
    render(delta: number): void
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
}

class SimpleBackground extends BaseBackground {
    constructor(container: HTMLElement) {
        super(container, false)
        this.setReady()
    }
}

export {
    IBackground,
    BaseBackground,
    SimpleBackground
}