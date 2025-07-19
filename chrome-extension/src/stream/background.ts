import { IBackground, SimpleBackground, SolidBackground } from './effects/baseBackground';
import { Feature, isFeatureEnabled, SettingsState } from '../view/application/state/settings';
import flow128_png from './img/flow128.png';
import flow128w_png from './img/flow128w.png';

enum BackgroundType {
    Light,
    Dark,
    Ashfall,
    Matrix,
    Fireflies,
    ColorOrbs,
    Transparent_Black,
    Transparent_White,
}

interface BackgroundSpec {
    type: BackgroundType,
    title: string,
    dark: boolean,
    extra?: any
}

const factories = new Map<BackgroundType, () => Promise<any>>([
    // For simple, non-dynamic backgrounds, we wrap them in a resolved promise
    // to keep the interface consistent.
    [BackgroundType.Light, () => Promise.resolve({ default: SolidBackground })],
    [BackgroundType.Dark, () => Promise.resolve({ default: SolidBackground })],
    [BackgroundType.Transparent_Black, () => Promise.resolve({ default: SimpleBackground })],
    [BackgroundType.Transparent_White, () => Promise.resolve({ default: SimpleBackground })],
    
    // For heavy backgrounds, we use dynamic import()
    [BackgroundType.Ashfall, () => import(/* webpackChunkName: "ashfall-effect" */ './effects/ashfall/main')],
    [BackgroundType.Matrix, () => import(/* webpackChunkName: "matrix-effect" */ './effects/matrix/main')],
    [BackgroundType.Fireflies, () => import(/* webpackChunkName: "fireflies-effect" */ './effects/fireflies/main')],
    [BackgroundType.ColorOrbs, () => import(/* webpackChunkName: "color-orbs-effect" */ './effects/color-orbs/main')],
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
async function loadBackground(type: BackgroundType | undefined, container: HTMLElement, oldContainer?: HTMLElement) {
    if (type && (type < 0 || !factories.has(type))) {
        type = undefined;
    }

    const id = container.id;
    let i: IBackground | undefined = instances[id];
    if (i && i.type == type && !i.ready) {
        return; // loading
    }
    
    if (i && i.type != type) {
        i.cleanUp();
        delete instances[id];
        i = undefined;
    }

    if (type === undefined) {
        container.style.color = '';
    }
    
    // Prevent re-creating if canvas already exists from a previous background
    if (type === undefined || container.querySelector('canvas')) {
        return;
    }

    // --- START OF MAJOR CHANGES ---

    // Add a loading state to the UI so the user knows something is happening
    container.classList.add('background-loading');
    
    const spec = getBackgroundSpec(type);
    if (spec) {
        container.style.color = spec.dark ? 'white' : 'black';
    }

    if (oldContainer) {
        if (i && i.container == oldContainer) {
            i.container = container;
        }
        const canvas = oldContainer.querySelector('canvas');
        if (canvas) {
            container.append(canvas);
            // We moved the canvas, but we still need to create the new logic controller
        }
    }

    try {
        // 1. Get the importer function from our map
        const importer = factories.get(type);
        if (!importer) throw new Error(`No importer for background type ${type}`);
        
        // 2. Await the dynamic import(). This is where the network request happens!
        const backgroundModule = await importer();
        
        // 3. Get the class from the 'default' export of the module
        const BackgroundClass = backgroundModule.default;
        
        // 4. Create the new instance
        const newBackground: IBackground = new BackgroundClass(container, spec?.extra);
        newBackground.type = type;
        instances[id] = newBackground;
        
        if (!animating && newBackground.isAnimated) {
            animate(0);
            animating = true;
        }
    } catch (error) {
        console.error("Failed to load background:", error);
        // Handle the error, maybe fall back to a simple background
    } finally {
        // Always remove the loading state
        container.classList.remove('background-loading');
    }
}

const backgroundList = (settings?: SettingsState): BackgroundSpec[] => [
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
        type: BackgroundType.Transparent_Black,
        title: 'Transparent (black)',
        dark: false,
    },
    {
        type: BackgroundType.Transparent_White,
        title: 'Transparent (white)',
        dark: true,
    },
    ...(!settings || isFeatureEnabled(settings, Feature.streamBackgroundInDevelopment) ? [
        {
            type: BackgroundType.ColorOrbs,
            title: 'Color Orbs (WIP)',
            dark: true,
        }
    ] : [])
]

function getLogoUrl(darkBackground: boolean) {
    return darkBackground ? flow128w_png : flow128_png
}

function getBackgroundSpec(type: BackgroundType): BackgroundSpec | undefined {
    return backgroundList(undefined).find(i => i.type == type)
}

export default loadBackground
export {
    BackgroundType,
    BackgroundSpec,
    backgroundList,
    getLogoUrl,
    getBackgroundSpec,
}
