import { DependencyList, useEffect } from 'react';
import { BackgroundType, loadBackground } from '../../../stream/background'

const useBackground = (type: BackgroundType, contentId: string, deps: DependencyList = []) => {
  useEffect(() => {
    const container = document.getElementById(contentId)
    if (container)
      loadBackground(type, container)
    return () => { }
  }, deps)
}

export default useBackground