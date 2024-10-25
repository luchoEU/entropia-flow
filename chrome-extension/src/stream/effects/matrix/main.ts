// Derived from https://codepen.io/pavi2410/pen/oNjGVgM Copyright (c) 2024 Pavitra Golchha (MIT License)

import { AnimatedBackground } from "../baseBackground";

const state = {
  fullFallTime: 3.0,
  color: "#0f0",
  charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ@#$%^&*()_+-=[]{}|;:',.<>/?`~",
  verticalLength: 25,
  minDistance: 3,
  opacity: 0.05
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

  protected override onContainerResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    const fontSize = this.height / state.verticalLength;
    this.heightInCharacters = Math.floor(this.height / fontSize);
    this.positions = Array(Math.ceil(this.width / fontSize));
    let lastM = 0;
    for (let i = 0; i < this.positions.length; i++) {
      let m = Math.floor(Math.random() * this.heightInCharacters);
      while (Math.abs(lastM - m) < state.minDistance) {
        m = Math.floor(Math.random() * this.heightInCharacters);
      }
      lastM = m;
      this.positions[i] = Math.floor(m) * fontSize;
    }

    const canvas = this.container.querySelector("canvas") as HTMLCanvasElement;
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.width, this.height);

    /* Commented because of performance issues
    for (let i = 0; i < this.heightInCharacters; i++) {
      this.draw(ctx);
    }
    */
  }

  private draw(ctx: CanvasRenderingContext2D) {
    const random = (items: string) => items[Math.floor(Math.random() * items.length)];

    ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(state.opacity, 1 / this.heightInCharacters)})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = state.color;
  
    const fontSize = this.height / state.verticalLength;
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < this.positions.length; i++) {
      let v = this.positions[i];
      ctx.fillText(random(state.charset), i * fontSize, v);
      this.positions[i] = v >= this.height ? 0 : v + fontSize;
    }
  }

  public override render(delta: number) {
    const canvas = this.container.querySelector("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const fps = this.heightInCharacters / state.fullFallTime
    while (this.elapsed < delta) {
      this.elapsed += 1000 / fps
      this.draw(ctx)
    }
  }
}

export default MatrixBackground