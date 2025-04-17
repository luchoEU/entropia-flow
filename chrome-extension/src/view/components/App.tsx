import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux';
import { pageLoaded } from '../application/actions/ui';
import './App.scss'
import { store } from '../application/store';
import Navigation from './Navigation';
import Content from './Content';
import { HashRouter } from 'react-router-dom';

function _AppWithPageLoaded() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(pageLoaded)
  }, [])

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
