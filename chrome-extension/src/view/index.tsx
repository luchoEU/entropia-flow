import React from 'react'
import ReactDOM from 'react-dom/client';
import App from './components/App'

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    const root = ReactDOM.createRoot(document.getElementById('root')); // Create root
    root.render(<App />);
})
