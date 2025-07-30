// Derived from https://codepen.io/pavi2410/pen/oNjGVgM Copyright (c) 2024 Pavitra Golchha (MIT License)

import { AnimatedBackground } from "../baseBackground";

const state = {
    color: "#0f0",
    charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ@#$%^&*()_+-=[]{}|;:',.<>/?`~",
    verticalLength: 25,
    minDistance: 3,
    opacity: 0.05,
    fallSpeed: 100, // pixels per second,
    fontSize: 6, // fixed size in pixels
    fps: 8
};

class MatrixBackground extends AnimatedBackground {
    private elapsed: number = 0
    private width: number
    private height: number
    private heightInCharacters: number
    private positions: number[]

    constructor(container: HTMLElement) {
        super(container)
        this.init()
        this.setReady()
    }

    private init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
    }

    protected override onContainerResize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.heightInCharacters = Math.floor(this.height / state.fontSize);
        this.positions = Array(Math.ceil(this.width / state.fontSize));
        let lastM = 0;
        for (let i = 0; i < this.positions.length; i++) {
            let m = Math.floor(Math.random() * this.heightInCharacters);
            while (Math.abs(lastM - m) < state.minDistance) {
                m = Math.floor(Math.random() * this.heightInCharacters);
            }
            lastM = m;
            this.positions[i] = Math.floor(m) * state.fontSize;
        }

        const canvas = this.container.querySelector("canvas") as HTMLCanvasElement;
        canvas.width = this.width;
        canvas.height = this.height;

        const ctx = canvas.getContext("2d");
        for (let i = 0; i < this.heightInCharacters; i++) {
            this.draw(ctx);
        }
    }
    
    private draw(ctx: CanvasRenderingContext2D | null) {
        if (!this.positions || !ctx) return // onContainerResize not called yet

        const random = (items: string) => items[Math.floor(Math.random() * items.length)];

        ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(state.opacity, 1 / this.heightInCharacters)})`;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.fillStyle = state.color;

        ctx.font = `${state.fontSize}px monospace`;
        for (let i = 0; i < this.positions.length; i++) {
            let v = this.positions[i];
            ctx.fillText(random(state.charset), i * state.fontSize, v);
            this.positions[i] = v >= this.height ? 0 : v + state.fontSize;
        }
    }

    public override render(delta?: number) {
        if (!this.positions) return // onContainerResize not called yet

        const canvas = this.container.querySelector("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");

        if (delta === undefined) {
            this.draw(ctx)
        } else {
            if (this.elapsed === 0)
                this.elapsed = delta - 1

            while (this.elapsed < delta) {
                this.elapsed += 1000 / state.fps
                this.draw(ctx)
            }
        }
    }
}

export default MatrixBackground
