function render(data) {
    const size = entropiaFlowStream.render(data)
    if (size)
        chrome.webview.hostObjects.resize.OnRendered(size.width, size.height)
}
