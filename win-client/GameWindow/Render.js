let renderEnabled = true
let lastData = undefined

function render(data) {
    lastData = data
    if (!renderEnabled)
        return;

    const size = entropiaFlowStream.render(data);
    if (size && size.width > 100)
        chrome.webview?.hostObjects.resize.OnRendered(size.width, size.height);
}

function onImageClick() {
    if (renderEnabled) {
        renderEnabled = false
        document.getElementById("hoverArea").className = 'minimized'
        chrome.webview?.hostObjects.resize.OnRendered(30, 30);
    } else {
        renderEnabled = true
        document.getElementById("hoverArea").className = ''
        if (lastData)
            render(lastData)
        else
            chrome.webview?.hostObjects.resize.OnRendered(70, 200);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    //render({ "background": 2, "delta": 1, "message": "testing" })

    const hoverImage = document.getElementById("hoverImage");
    hoverImage.addEventListener("click", onImageClick);
});
