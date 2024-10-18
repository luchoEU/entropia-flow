# Chrome Extension

## Building

1. `nvm use 21.7.1`
2. `npm i` to install dependencies
3. `npm run dev` to compile once or `npm run watch` to run the dev task in watch mode
4. `npm run build` to build a production (minified) version

## Building for Windows Client

1. `npm run stream` or `npm run stream-dev`
2. Copy `chrome-extension\dist.win` directory to `win-client\bin\Debug\net8-windows\GameWindow\dist.win`

## Installation

1. Complete the steps to build the project above
2. Go to [_chrome://extensions_](chrome://extensions) in Google Chrome
3. With the developer mode checkbox ticked, click **Load unpacked extension...** and select the _dist_ folder from this repo

## Testing

1. Run all test `npm test`
2. Debug Test
    a. `Debug: Javascript Debug Terminal` from Command Pallete
    b. `npm test -- --watch`

## Publication

1. Make a zip of _dist_ folder without including the folder
2. Enter to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and sign in
3. In the _Package_ section click _Upload Updated Package_ and select the new .zip
4. Submit Changes and wait for approval
