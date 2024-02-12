import loadLight from './effects/light/main'
import loadDark from './effects/dark/main'
import loadAshfall from './effects/ashfall/main'

enum BackgroundType {
  Light,
  Dark,
  Ashfall,
}

interface BackgroundSpec {
  key: number,
  type: BackgroundType,
  title: string,
  icon: string,
}

const map = new Map<BackgroundType, any>([
  [BackgroundType.Light, loadLight],
  [BackgroundType.Dark, loadDark],
  [BackgroundType.Ashfall, loadAshfall]
]);

function loadBackground(type: BackgroundType, container: HTMLElement) {
  map.get(type)(container)
}

const backgroundList: BackgroundSpec[] = [
  {
      key: 0,
      type: BackgroundType.Light,
      title: 'Light',
      icon: 'img/flow128.png',
  },
  {
      key: 1,
      type: BackgroundType.Dark,
      title: 'Dark',
      icon: 'img/flow128w.png',
  },
  {
      key: 2,
      type: BackgroundType.Ashfall,
      title: 'Ashfall',
      icon: 'img/flow128w.png',
  }
]

const getIcon = (type: BackgroundType): string => backgroundList[type].icon

export {
  BackgroundType,
  BackgroundSpec,
  backgroundList,
  getIcon,
  loadBackground
}