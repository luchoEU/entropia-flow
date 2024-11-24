import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<StrictMode><App/></StrictMode>, // for React DevTools `npx react-devtools`
//  ReactDOM.render(<App/>,
        document.getElementById('root'))
})
