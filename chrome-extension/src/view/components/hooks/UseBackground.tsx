import { DependencyList, useEffect } from 'react';
import { BackgroundType } from '../../application/state/stream';
import loadLight from '../stream/effects/light/main'
import loadDark from '../stream/effects/dark/main'
import loadAshfall from '../stream/effects/ashfall/main'

const useBackground = (type: BackgroundType, contentId: string, deps: DependencyList = []) => {
  const map = new Map<BackgroundType, any>()
  map.set(BackgroundType.Light, loadLight)
  map.set(BackgroundType.Dark, loadDark)
  map.set(BackgroundType.Ashfall, loadAshfall)

  useEffect(() => {
    const content: HTMLElement = document.getElementById(contentId)
    if (content)
      map.get(type)(content)
    return () => { }
  }, deps)
}

export default useBackground