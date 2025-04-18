import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux';
import './App.scss'
import { store } from '../application/store';
import Navigation from './Navigation';
import Content from './Content';
import { HashRouter } from 'react-router-dom';
import { useAppDispatch } from '../application/store';
import { useSelector } from 'react-redux';
import { appAction, initialize, isAppLoaded } from '../application/slice/app';

function _AppWithInitializer() {
    const dispatch = useAppDispatch();
    const isLoaded = useSelector(isAppLoaded);
    const [showSoftLoader, setShowSoftLoader] = useState(true);
    const [appInvisible, setAppInvisible] = useState(true);

    useEffect(() => {
        dispatch(initialize());
        const timeout = setTimeout(() => { setShowSoftLoader(false); }, 500); // show a soft loader for 500ms
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!isLoaded) return
        dispatch(appAction.loaded);
        const timeout = setTimeout(() => { setAppInvisible(false); }, 100); // let it calculate stream layout sizes
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
    <Provider store={store}>
      <HashRouter>
        <_AppWithInitializer />
      </HashRouter>
    </Provider>
  )
}

export default App
