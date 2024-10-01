# Chrome Extension

## Building

1.  `nvm use 21.7.1`
2.  `npm i` to install dependencies
3.  `npm run dev` to compile once or `npm run watch` to run the dev task in watch mode
4.  `npm run build` to build a production (minified) version

## Installation

1.  Complete the steps to build the project above
2.  Go to [_chrome://extensions_](chrome://extensions) in Google Chrome
3.  With the developer mode checkbox ticked, click **Load unpacked extension...** and select the _dist_ folder from this repo

## Publication

1. Make a zip of _dist_ folder without including the folder
2. Enter to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and sign in
3. In the _Package_ section click _Upload Updated Package_ and select the new .zip
4. Submit Changes and wait for approval
