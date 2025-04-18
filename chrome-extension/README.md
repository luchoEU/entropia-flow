# Chrome Extension

## Building

1. `nvm use 22.12.0`

1. `npm i` to install dependencies

1. `npm run dev` to compile once or `npm run watch` to run the dev task in watch mode

## Building for Windows Client

1. `npm run stream` or `npm run stream-dev`

1. Use `chrome-extension/dist.win/EntropiaFlowStream.js` in Windows Client

## Local Installation

1. Complete the steps to build the project above

1. Go to [_chrome://extensions_](chrome://extensions) in Google Chrome

1. With the developer mode checkbox ticked, click **Load unpacked extension...** and select the _dist_ folder from this repo

## Testing

- Run all tests
    `npm test`

- Debug Test
    1. `Debug: Javascript Debug Terminal` from Command Pallete
    1. `npm test -- --watch`

## Debug with React DevTools

- Use branch `debug/react`

## Publication

1. Increase version in [package.json](package.json), [manifest.json](dist/manifest.json) and [AboutPage.tsx](src/view/components/about/AboutPage.tsx)

1. Update [CHANGESLOG.md](CHANGESLOG.md)

1. Execute `npm run build` to build a production (minified) version in [dist.zip](dist.zip)

1. Do manual testing

1. Enter to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and sign in

1. In the _Package_ section click _Upload Updated Package_ and select the new .zip

1. Submit Changes and wait for approval
