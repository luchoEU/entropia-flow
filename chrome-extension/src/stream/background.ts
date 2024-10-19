import AshfallBackground from './effects/ashfall/main'
import { IBackground, SimpleBackground } from './effects/baseBackground';
import MatrixBackground from './effects/matrix/main'

enum BackgroundType {
  Light,
  Dark,
  Ashfall,
  Matrix,
}

interface BackgroundSpec {
  key: number,
  type: BackgroundType,
  title: string,
  icon: string,
  style: Record<string, string>
}

const factories = new Map<BackgroundType, (new (container: HTMLElement) => IBackground)>([
  [BackgroundType.Light, SimpleBackground],
  [BackgroundType.Dark, SimpleBackground],
  [BackgroundType.Ashfall, AshfallBackground],
  [BackgroundType.Matrix, MatrixBackground]
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
  if (instances.some(i => i.container == container && i.type == type && !i.ready))
    return // loading
  
  instances = instances.filter(i => {
    if (i.container == container && i.type != type) {
      // remove old canvas, the type has changed
      const canvas = container.querySelector('canvas')
      if (canvas)
        container.removeChild(canvas)
      return false
    }
    return true
  })

  if (container.querySelector('canvas'))
    return

  Object.assign(container.style, backgroundList[type].style);

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
      key: 0,
      type: BackgroundType.Light,
      title: 'Light',
      icon: 'img/flow128.png',
      style: {
          'color': 'black',
          'background-color': 'white'
      }
  },
  {
      key: 1,
      type: BackgroundType.Dark,
      title: 'Dark',
      icon: 'img/flow128w.png',
      style: {
        'color': 'white',
        'background-color': 'black'
      }
  },
  {
      key: 2,
      type: BackgroundType.Ashfall,
      title: 'Ashfall',
      icon: 'img/flow128w.png',
      style: {
        'color': 'white',
      }
  },
  {
      key: 3,
      type: BackgroundType.Matrix,
      title: 'Matrix',
      icon: 'img/flow128w.png',
      style: {
        'color': 'white',
      }
  }
]

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