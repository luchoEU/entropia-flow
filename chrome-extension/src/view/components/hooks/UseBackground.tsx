import { DependencyList, useEffect } from 'react';
import { BackgroundType, loadBackground } from '../../../stream/background'

const useBackground = (type: BackgroundType, contentId: string, deps: DependencyList = []) => {
  useEffect(() => {
    loadBackground(type, contentId)
    return () => { }
  }, deps)
}

export default useBackground