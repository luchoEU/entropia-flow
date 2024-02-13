import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { pageLoaded } from '../application/actions/ui';
import './App.scss'
import Navigation from './Navigation';
import Content from './Content';

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(pageLoaded)
  }, [])

  return (
    <>
      <Navigation />
      <Content />
    </>
  )
}

export default App