import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux';
import { pageLoaded } from '../application/actions/ui';
import './App.scss'
import { configureStore } from '../application/store';
import services from '../services';
import Navigation from './Navigation';
import Content from './Content';

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
    <Provider store={configureStore(services)}>
      <_AppWithPageLoaded />
    </Provider>
  )
}

export default App
