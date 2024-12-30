document.addEventListener('contextmenu', function(e) {
    //e.preventDefault();
});

document.addEventListener('mousedown', function (e) {
    clickDisabled = false;
    e.preventDefault();
    if (e.button === 0) // left
        chrome.webview?.hostObjects.mouse.OnMouseDown();
});

document.addEventListener('mousemove', function(e) {
    e.preventDefault();
    chrome.webview?.hostObjects.mouse.OnMouseMove();
});

document.addEventListener('mouseup', function(e) {
    e.preventDefault();
    if (e.button === 0) // left
        chrome.webview?.hostObjects.mouse.OnMouseUp();
});
