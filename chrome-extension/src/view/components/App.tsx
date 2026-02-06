import React, { useEffect, useState } from 'react'
import { Provider as JotaiProvider, useAtomValue, useSetAtom } from 'jotai';
import './App.scss'
import Navigation from './Navigation';
import { Content } from './Content';
import { HashRouter } from 'react-router-dom';
import { ActivityBridge } from './bridges/ActivityBridge';
import { HistoryBridge } from './bridges/HistoryBridge';
import { initializeAppAtom, appInitializedAtom } from '../application/atoms/app';

function _AppWithInitializer() {
    const isLoaded = useAtomValue(appInitializedAtom);
    const [showSoftLoader, setShowSoftLoader] = useState(true);
    const [appInvisible, setAppInvisible] = useState(true);
    const initializeApp = useSetAtom(initializeAppAtom);

    useEffect(() => {
        initializeApp();
        const timeout = setTimeout(() => { setShowSoftLoader(false); }, 500); // show a soft loader for 500ms
        return () => clearTimeout(timeout);
    }, [initializeApp]);

    useEffect(() => {
        if (!isLoaded) return

        // App is now initialized, make it visible after brief delay
        // This gives time to calculate stream layout sizes
        const timeout = setTimeout(() => { setAppInvisible(false); }, 100);
        return () => clearTimeout(timeout);
    }, [isLoaded]);

    return <>
        { isLoaded && <div className={appInvisible ? 'app-invisible' : ''}>
            <Navigation />
            <Content />
        </div> }
        { appInvisible && <div className="loader-screen">
            <img style={showSoftLoader ? { visibility: 'hidden' } : {}} src="img/flow128.png" alt="loading" />
            <p style={showSoftLoader ? { color: 'lightgray' } : {}} >Loading Entropia Flow...</p>
        </div> }
    </>;
}

function App() {
  return (
    <JotaiProvider>
      <HashRouter>
        <ActivityBridge />
        <HistoryBridge />
        <_AppWithInitializer />
      </HashRouter>
    </JotaiProvider>
  )
}

export default App
