/**
 * Copies the given text to the clipboard using the modern browser API.
 * @param {string} text The text to copy.
 */
async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log(`Text successfully copied to clipboard: "${text}"`);
        return true

    } catch (err) {
        console.error('Failed to copy text to clipboard:', err);
        return false
    }
}

/**
 * Gets the local IPv4 address of the machine.
 * @returns {Promise<string|null>} A promise that resolves with the IP address string, or null if not found.
 */
async function getLocalIpAddress() {
    let command;
    let parsingRegex;

    // Use the NL_OS global variable to determine the operating system
    switch (NL_OS) {
        case 'Windows':
            command = 'ipconfig';
            // On Windows, we look for the "IPv4 Address" line.
            parsingRegex = /IPv4 Address[.\s]+:\s*([0-9.]+)/;
            break;
        case 'Darwin': // macOS
        case 'Linux':
            command = 'ifconfig';
            // On macOS/Linux, we look for "inet" followed by an IP, excluding the loopback address.
            parsingRegex = /inet\s+([0-9.]+)/g;
            break;
        default:
            console.error("Unsupported operating system:", NL_OS);
            return null;
    }

    try {
        const { stdOut } = await Neutralino.os.execCommand(command);

        if (NL_OS === 'Windows') {
            const match = stdOut.match(parsingRegex);
            if (match && match[1]) {
                return match[1]; // Return the first captured group (the IP)
            }
        } else { // For macOS and Linux
            const matches = [...stdOut.matchAll(parsingRegex)];
            for (const match of matches) {
                const ip = match[1];
                // Filter out the loopback address
                if (ip && ip !== '127.0.0.1') {
                    return ip; // Return the first non-loopback IP found
                }
            }
        }

        console.error("Could not find a valid IPv4 address in the command output.");
        return null;

    } catch (err) {
        console.error(`Error executing command '${command}':`, err);
        return null;
    }
}

let _deltaW = 0
let _deltaH = 0

async function setContentSize(size) {
    if (window.innerWidth === size.width && window.innerHeight === size.height) return;

    // Set an initial guess    
    const initialGuessSize = { width: size.width + _deltaW, height: size.height + _deltaH };
    await Neutralino.window.setSize(initialGuessSize);

    // Wait a moment for the resize to settle
    setTimeout(() => {
        const contentWidth = window.innerWidth;
        const contentHeight = window.innerHeight;

        if (contentWidth === size.width && contentHeight === size.height) return;

        _deltaW = initialGuessSize.width - contentWidth;
        _deltaH = initialGuessSize.height - contentHeight;

        const adjustedSize = { width: size.width + _deltaW, height: size.height + _deltaH };
        Neutralino.window.setSize(adjustedSize);
    }, 100);
}

async function setWindowPosition(x, y) {
    await Neutralino.window.move(x, y);
}
