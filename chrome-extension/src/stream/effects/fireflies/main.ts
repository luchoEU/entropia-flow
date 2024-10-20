// Derived from https://codepen.io/mikegolus/pen/Jegvym Copyright (c) 2024 Mike Golus (MIT License)

import { BaseBackground } from "../baseBackground";

const state = {
    quantity: 15
}

class FirefliesBackground extends BaseBackground {
    constructor(container: HTMLElement) {
        super(container, false)
        this.addFireflyStyle()
        this.generateFirefliesInContainer()
        this.setReady()
    }

    private generateFirefliesInContainer() {
        if (this.container.getElementsByClassName('firefly-container')[0]) return
        
        const fireflyContainer: HTMLDivElement = document.createElement('div');
        fireflyContainer.className = 'firefly-container';
        this.container.appendChild(fireflyContainer);

        for (let i = 1; i <= state.quantity; i++) {
            const firefly = document.createElement('div');
            firefly.classList.add('firefly');
            fireflyContainer.appendChild(firefly);
        }
    }

    public override cleanUp(): void {
        const fireflyContainer = this.container.getElementsByClassName('firefly-container')[0]
        if (fireflyContainer)
          this.container.removeChild(fireflyContainer)
    }

    private addFireflyStyle() {
        if (document.getElementById('fireflies-style')) return
        
        const style: HTMLStyleElement = document.createElement('style');
        style.id = 'fireflies-style';
        document.head.appendChild(style);

        style.innerHTML = `
        .firefly-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-image: url('effects/fireflies.jpg');
            background-size: cover;
            z-index: -1;
        }
        .firefly {
            position: absolute;
            width: 3px;
            height: 3px;
            animation: ease 200s alternate infinite;
            pointer-events: none;
        }
        .firefly::before, .firefly::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            transform-origin: -20px;
        }
        .firefly::before {
            background: black;
            opacity: 0.4;
            animation: drift ease alternate infinite;
        }
        .firefly::after {
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
            style.innerHTML += `
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
            .firefly:nth-child(${i}) {
                animation-name: move${i}
            }
            .firefly:nth-child(${i})::before {
                animation-duration: ${rotationSpeed}s;
            }
            .firefly:nth-child(${i})::after {
                animation-duration: ${rotationSpeed}s, ${random(5000, 11000)}ms;
                animation-delay: 0ms, ${random(500, 8500)}ms;
            }
            `;
        }
    }
}

export default FirefliesBackground