import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<App/>,
        document.getElementById('root'))
})
