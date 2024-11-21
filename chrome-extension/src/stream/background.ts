import { IBackground, SimpleBackground } from './effects/baseBackground';
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
}

interface BackgroundSpec {
  type: BackgroundType,
  title: string,
  icon: string,
  style: Record<string, string>
}

const factories = new Map<BackgroundType, (new (container: HTMLElement) => IBackground)>([
  [BackgroundType.Light, SimpleBackground],
  [BackgroundType.Dark, SimpleBackground],
  [BackgroundType.Ashfall, AshfallBackground],
  [BackgroundType.Matrix, MatrixBackground],
  [BackgroundType.Fireflies, FirefliesBackground],
  [BackgroundType.ColorOrbs, ColorOrbsBackground],
]);

let instances: { [id: string]: IBackground } = { }
let animating: boolean

function animate(delta: number) {
  instances = Object.fromEntries(Object.entries(instances).filter(([,v]) => v.container.parentElement))
  const animated = Object.values(instances).filter(i => i.isAnimated)
  const toRender = animated.filter(i => i.container.querySelector('canvas'))
  toRender.forEach(i => i.render(delta));
  if (animated.length > 0)
    window.requestAnimationFrame(animate);
  else
    animating = false
}

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

  if (type === undefined || container.querySelector('canvas'))
    return

  const style = backgroundList[type].style
  Object.keys(style).forEach(key => container.style[key] = style[key]);

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

  const newBackground: IBackground = new (factories.get(type))(container)
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
    icon: flow128_png,
    style: {
      'color': 'black',
      'background-color': 'white'
    }
  },
  {
    type: BackgroundType.Dark,
    title: 'Dark',
    icon: flow128w_png,
    style: {
      'color': 'white',
      'background-color': 'black'
    }
  },
  {
    type: BackgroundType.Ashfall,
    title: 'Ashfall',
    icon: flow128w_png,
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  },
  {
    type: BackgroundType.Matrix,
    title: 'Matrix',
    icon: flow128w_png,
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  },
  {
    type: BackgroundType.Fireflies,
    title: 'Fireflies',
    icon: flow128w_png,
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  },
]

if (SHOW_FEATURES_IN_DEVELOPMENT) {
  backgroundList.push({
    type: BackgroundType.ColorOrbs,
    title: 'Color Orbs (WIP)',
    icon: flow128w_png,
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  })
}

const getIconUrl = (type: BackgroundType): string => {
  if (type)
    return backgroundList[type].icon
  else
    return flow128_png
}

export {
  BackgroundType,
  BackgroundSpec,
  backgroundList,
  getIconUrl,
  loadBackground
}