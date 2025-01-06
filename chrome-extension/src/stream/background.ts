import { IBackground, SimpleBackground, SolidBackground } from './effects/baseBackground';
import AshfallBackground from './effects/ashfall/main'
import MatrixBackground from './effects/matrix/main'
import FirefliesBackground from './effects/fireflies/main';
import ColorOrbsBackground from './effects/color-orbs/main';
import { SHOW_FEATURES_IN_DEVELOPMENT } from '../config';
import flow128_png from './img/flow128.png';
import flow128w_png from './img/flow128w.png';

enum BackgroundType {
    Light,
    Dark,
    Ashfall,
    Matrix,
    Fireflies,
    ColorOrbs,
    Transparent,
}

interface BackgroundSpec {
    type: BackgroundType,
    title: string,
    dark: boolean,
    extra?: any
}

const factories = new Map<BackgroundType, (new (container: HTMLElement, extra?: any) => IBackground)>([
    [BackgroundType.Light, SolidBackground],
    [BackgroundType.Dark, SolidBackground],
    [BackgroundType.Ashfall, AshfallBackground],
    [BackgroundType.Matrix, MatrixBackground],
    [BackgroundType.Fireflies, FirefliesBackground],
    [BackgroundType.ColorOrbs, ColorOrbsBackground],
    [BackgroundType.Transparent, SimpleBackground],
]);

let instances: { [id: string]: IBackground } = { }
let animating: boolean

function animate(delta: number) {
    instances = Object.fromEntries(Object.entries(instances).filter(([,v]) => v.container.isConnected))
    const animated = Object.values(instances).filter(i => i.isAnimated)
    const toRender = animated.filter(i => i.container.querySelector('canvas'))
    toRender.forEach(i => i.render(delta));
    if (animated.length > 0)
        window.requestAnimationFrame(animate);
    else
    animating = false
}

// each container must have an unique id
function loadBackground(type: BackgroundType, container: HTMLElement, oldContainer: HTMLElement) {
    if (type < 0 || type > factories.size - 1)
        type = BackgroundType.Light
    
    const id = container.id
    let i = instances[id]
    if (i && i.type == type && !i.ready)
        return // loading
    
    if (i && i.type != type) {
        i.cleanUp()
        delete instances[id]
        i = undefined
    }
    
    if (type === undefined) {
        container.style.color = ''
    }
    
    if (type === undefined || container.querySelector('canvas'))
        return
    
    const { dark, extra } = getBackgroundSpec(type)
    container.style.color = dark ? 'white' : 'black'
    
    if (oldContainer) {
        if (i && i.container == oldContainer) {
            i.container = container
        }
        const canvas = oldContainer.querySelector('canvas')
        if (canvas) {
            container.append(canvas)
            return
        }
    }
    
    const newBackground: IBackground = new (factories.get(type))(container, extra)
    newBackground.type = type
    instances[id] = newBackground
    
    if (!animating && newBackground.isAnimated) {
        animate(0);
        animating = true
    }
}

const backgroundList: BackgroundSpec[] = [
    {
        type: BackgroundType.Light,
        title: 'Light',
        dark: false,
        extra: 'white'
    },
    {
        type: BackgroundType.Dark,
        title: 'Dark',
        dark: true,
        extra: 'black'
    },
    {
        type: BackgroundType.Ashfall,
        title: 'Ashfall',
        dark: true,
    },
    {
        type: BackgroundType.Matrix,
        title: 'Matrix',
        dark: true,
    },
    {
        type: BackgroundType.Fireflies,
        title: 'Fireflies',
        dark: true,
    },
    {
        type: BackgroundType.Transparent,
        title: 'Transparent',
        dark: false,
    },
]

if (SHOW_FEATURES_IN_DEVELOPMENT) {
    backgroundList.push({
        type: BackgroundType.ColorOrbs,
        title: 'Color Orbs (WIP)',
        dark: true,
    })
}

function getLogoUrl(darkBackground: boolean) {
    return darkBackground ? flow128w_png : flow128_png
}

function getBackgroundSpec(type: BackgroundType): BackgroundSpec {
    return backgroundList.find(i => i.type == type)
}

export default loadBackground
export {
    BackgroundType,
    BackgroundSpec,
    backgroundList,
    getLogoUrl,
    getBackgroundSpec,
}
