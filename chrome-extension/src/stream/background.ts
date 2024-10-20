import { IBackground, SimpleBackground } from './effects/baseBackground';
import AshfallBackground from './effects/ashfall/main'
import MatrixBackground from './effects/matrix/main'
import FirefliesBackground from './effects/fireflies/main';
import ColorOrbsBackground from './effects/color-orbs/main';
import { SHOW_FEATURES_IN_DEVELOPMENT } from '../config';

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

let instances: IBackground[] = []
let animating: boolean

function animate(delta: number) {
  instances = instances.filter(i => i.container.parentElement)
  const actives = instances.filter(i => i.container.querySelector('canvas') && i.isAnimated)
  actives.forEach(i => i.render(delta));
  if (instances.length > 0)
    window.requestAnimationFrame(animate);
  else
    animating = false
}

function loadBackground(type: BackgroundType, container: HTMLElement, oldContainer: HTMLElement) {
  if (type < 0 || type > factories.size - 1)
    type = BackgroundType.Light

  if (instances.some(i => i.container == container && i.type == type && !i.ready))
    return // loading
  
  instances = instances.filter(i => {
    if (i.container == container && i.type != type) {
      i.cleanUp()
      return false
    }
    return true
  })

  if (type === undefined || container.querySelector('canvas'))
    return

  const style = backgroundList[type].style
  Object.keys(style).forEach(key => container.style[key] = style[key]);

  if (oldContainer) {
    instances.forEach(i => {
      if (i.container == oldContainer)
        i.container = container
    })
    const canvas = oldContainer.querySelector('canvas')
    if (canvas) {
      container.append(canvas)
      return
    }
  }

  const newBackground: IBackground = new (factories.get(type))(container)
  newBackground.type = type
  instances = instances.filter(i => i.container !== container)
  instances.push(newBackground)

  if (!animating && newBackground.isAnimated) {
    animate(0);
    animating = true
  }
}

const backgroundList: BackgroundSpec[] = [
  {
    type: BackgroundType.Light,
    title: 'Light',
    icon: 'img/flow128.png',
    style: {
      'color': 'black',
      'background-color': 'white'
    }
  },
  {
    type: BackgroundType.Dark,
    title: 'Dark',
    icon: 'img/flow128w.png',
    style: {
      'color': 'white',
      'background-color': 'black'
    }
  },
  {
    type: BackgroundType.Ashfall,
    title: 'Ashfall',
    icon: 'img/flow128w.png',
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  },
  {
    type: BackgroundType.Matrix,
    title: 'Matrix',
    icon: 'img/flow128w.png',
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  },
  {
    type: BackgroundType.Fireflies,
    title: 'Fireflies',
    icon: 'img/flow128w.png',
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
    icon: 'img/flow128w.png',
    style: {
      'color': 'white',
      'background-color': 'transparent'
    }
  })
}

const getIcon = (type: BackgroundType): string => {
  if (type)
    return backgroundList[type].icon
  else
    return 'img/flow128.png'
}

export {
  BackgroundType,
  BackgroundSpec,
  backgroundList,
  getIcon,
  loadBackground
}