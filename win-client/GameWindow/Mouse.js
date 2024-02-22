document.addEventListener('contextmenu', function(event)
{
    //event.returnValue = false;
});

document.addEventListener('mousedown', function(event)
{
    event.returnValue = false;
    if (event.button === 0) // left
        chrome.webview.hostObjects.mouse.OnMouseDown();
});

document.addEventListener('mousemove', function(event)
{
    event.returnValue = false;
    chrome.webview.hostObjects.mouse.OnMouseMove();
});

document.addEventListener('mouseup', function(event)
{
    event.returnValue = false;
    if (event.button === 0) // left
        chrome.webview.hostObjects.mouse.OnMouseUp();
});
