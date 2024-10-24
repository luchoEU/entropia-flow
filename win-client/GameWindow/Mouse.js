document.addEventListener('contextmenu', function(event) {
    //event.preventDefault();
});

document.addEventListener('mousedown', function(event) {
    event.preventDefault();
    if (event.button === 0) // left
        chrome.webview?.hostObjects.mouse.OnMouseDown();
});

document.addEventListener('mousemove', function(event) {
    event.preventDefault();
    chrome.webview?.hostObjects.mouse.OnMouseMove();
});

document.addEventListener('mouseup', function(event) {
    event.preventDefault();
    if (event.button === 0) // left
        chrome.webview?.hostObjects.mouse.OnMouseUp();
});
