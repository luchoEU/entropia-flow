import React, { useEffect } from 'react'
import { Provider } from 'react-redux';
import { pageLoaded } from '../application/actions/ui';
import './App.scss'
import { store } from '../application/store';
import Navigation from './Navigation';
import Content from './Content';
import { HashRouter } from 'react-router-dom';
import { useAppDispatch } from '../application/store';
import { useSelector } from 'react-redux';
import { selectIsAppLoaded } from '../application/slice/app';

function _AppWithPageLoaded() {
  const dispatch = useAppDispatch()
  const isLoaded = useSelector(selectIsAppLoaded);

  useEffect(() => {
      dispatch(pageLoaded())
  }, [])

  if (!isLoaded) {
    return (
        <div className="loader-screen">
            <img src="img/flow128.png" alt="loading" />
            <p>Loading Entropia Flow...</p>
        </div>
    );
  }

  return <>
    <Navigation />
    <Content />
  </>
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <_AppWithPageLoaded />
      </HashRouter>
    </Provider>
  )
}

export default App
