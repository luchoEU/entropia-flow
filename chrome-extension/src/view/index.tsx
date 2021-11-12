import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { configureStore } from './application/store';
import services from './services';
import App from './components/App'

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(
        <Provider store={configureStore(services)}>
            <App />
        </Provider>,
        document.getElementById('root'))
})