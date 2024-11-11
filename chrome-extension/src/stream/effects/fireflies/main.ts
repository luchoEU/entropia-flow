// Derived from https://codepen.io/mikegolus/pen/Jegvym Copyright (c) 2024 Mike Golus (MIT License)

import { CssBackground } from "../baseBackground";
import fireflies_jpg from "./fireflies.jpg";

const state = {
    quantity: 15
}

class FirefliesBackground extends CssBackground {
    constructor(container: HTMLElement) {
        super(container, state.quantity, 'firefly')
    }

    protected override getStyle(containerClassName: string, itemClassName: string): string {
        let style: string = `
        .${containerClassName} {
            background-image: url(${fireflies_jpg});
            background-size: cover;
        }
        .${itemClassName} {
            width: 3px;
            height: 3px;
            animation: ease 200s alternate infinite;
            pointer-events: none;
        }
        .${itemClassName}::before, .${itemClassName}::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            transform-origin: -20px;
        }
        .${itemClassName}::before {
            background: black;
            opacity: 0.4;
            animation: drift ease alternate infinite;
        }
        .${itemClassName}::after {
            background: white;
            opacity: 0;
            box-shadow: 0 0 0 0 yellow;
            animation: drift ease alternate infinite, flash ease infinite;
        }
        @keyframes drift {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        @keyframes flash {
            0%, 30%, 100% {
                opacity: 0;
                box-shadow: 0 0 0 0 yellow;
            }
            5% {
                opacity: 1;
                box-shadow: 0 0 2% 0.4% yellow;
            }
        }`;

        const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        for (let i = 1; i <= state.quantity; i++) {
            const steps = random(12, 28);
            const rotationSpeed = random(8, 18);
            style += `
            @keyframes move${i} {
                ${Array.from({ length: steps }, (_, step) => {
                    return `
                    ${(step * (100 / steps)).toFixed(2)}% {
                        left: ${random(0, 100)}%;
                        top: ${random(0, 100)}%;
                        transform: scale(${(random(25, 100) / 100).toFixed(2)});
                    }
                `}).join('')}
            }
            .${itemClassName}:nth-child(${i}) {
                animation-name: move${i}
            }
            .${itemClassName}:nth-child(${i})::before {
                animation-duration: ${rotationSpeed}s;
            }
            .${itemClassName}:nth-child(${i})::after {
                animation-duration: ${rotationSpeed}s, ${random(5000, 11000)}ms;
                animation-delay: 0ms, ${random(500, 8500)}ms;
            }
            `;
        }
        return style;
    }
}

export default FirefliesBackground
