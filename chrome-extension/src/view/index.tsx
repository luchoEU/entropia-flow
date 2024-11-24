import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './components/App'

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<StrictMode><App/></StrictMode>); // for React DevTools `npx react-devtools`
    //root.render(<App />);
})
