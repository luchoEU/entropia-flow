import loadLight from './effects/light/main'
import loadDark from './effects/dark/main'
import loadAshfall from './effects/ashfall/main'

enum BackgroundType {
  Light,
  Dark,
  Ashfall,
}

function loadBackground(type: BackgroundType, contentId: string) {
  const content: HTMLElement = document.getElementById(contentId)
  if (content) {
    const map = new Map<BackgroundType, any>()
    map.set(BackgroundType.Light, loadLight)
    map.set(BackgroundType.Dark, loadDark)
    map.set(BackgroundType.Ashfall, loadAshfall)
    map.get(type)(content)
  }
}

export {
  BackgroundType,
  loadBackground
}