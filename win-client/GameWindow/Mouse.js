document.addEventListener('contextmenu', function(e) {
    //e.preventDefault();
});

document.addEventListener('mousedown', function (e) {
    e.preventDefault();
    chrome.webview?.hostObjects.mouse.OnMouseDown(e.button, e.target.id);
});

document.addEventListener('mousemove', function(e) {
    e.preventDefault();
    chrome.webview?.hostObjects.mouse.OnMouseMove();
});

document.addEventListener('mouseup', function(e) {
    e.preventDefault();
    chrome.webview?.hostObjects.mouse.OnMouseUp(e.button);
});
