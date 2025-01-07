document.addEventListener('contextmenu', function(e) {
    //e.preventDefault();
});

document.addEventListener('mousedown', function (e) {
    _clickDisabled = false;
    e.preventDefault();
    if (e.button === 0) // left
        chrome.webview?.hostObjects.mouse.OnMouseDown(e.target.id, _scale ?? 1);
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
