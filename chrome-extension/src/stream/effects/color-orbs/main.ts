// Derived from https://codepen.io/hylobates-lar/pen/bGEQXgm Copyright (c) 2024 Alison Quaglia (MIT License)

import { CssBackground } from "../baseBackground";

const state = {
    dots: 40,
    quantity: 1
};

class ColorOrbsBackground extends CssBackground {
    constructor(container: HTMLElement) {
        super(container, state.quantity, 'color-orb')
    }

    protected override getStyle(containerClassName: string, itemClassName: string): string {
        const dots = () =>
            Array.from({length: state.dots}, () => {
                const x = -0.5 + Math.random() * 3;
                const y = -0.5 + Math.random() * 3;
                const h = Math.random() * 360;
                return `${x}em ${y}em 7px hsla(${h}, 100%, 50%, .9)`;
            }).join(', ');

        return `
            .${containerClassName} {
                font: 5vmin/1.3 Serif;
                background: #123;
            }
            .${itemClassName} {
                display: block;
                font-size: 52px;
                color: transparent;
            }
            .${itemClassName}::before, .${itemClassName}::after {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 3em;
                height: 3em;
                content: '.';
                mix-blend-mode: screen;
                animation: 44s -27s move infinite ease-in-out alternate;
            }
            .${itemClassName}:nth-child(1)::before {
                text-shadow: ${dots()};
                animation-duration: 44s;
                animation-delay: -27s;
            }
            .${itemClassName}:nth-child(1)::after {
                text-shadow: ${dots()};
                animation-duration: 43s;
                animation-delay: -32s;
            }
            .${itemClassName}:nth-child(2)::before {
                text-shadow: ${dots()};
                animation-duration: 42s;
                animation-delay: -23s;
            }
            .${itemClassName}:nth-child(2)::after {
                text-shadow: ${dots()};
                animation-duration: 41s;
                animation-delay: -19s;
            }
            @keyframes move {
                from {
                    transform: rotate(0deg) scale(12) translateX(-20px);
                }
                to {
                    transform: rotate(360deg) scale(18) translateX(20px);
                }
            }
        `;
    }
}

export default ColorOrbsBackground
