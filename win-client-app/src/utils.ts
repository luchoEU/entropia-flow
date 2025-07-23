/**
 * Copies the given text to the clipboard using the modern browser API.
 * @param {string} text The text to copy.
 */
async function copyTextToClipboard(text: string | null | undefined, popupId: string): Promise<boolean> {
    if (!text) return false;

    let copied = false;
    try {
        await navigator.clipboard.writeText(text);
        console.log(`Text successfully copied to clipboard: "${text}"`);
        copied = true
    } catch (err) {
        console.error('Failed to copy text to clipboard:', err);
    }

    if (popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.style.display = 'block';
            popup.innerText = copied ? 'Copied!' : 'Failed!';
            setTimeout(() => { popup.style.display = 'none' }, 1000);
        }
    }

    return copied;
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

export {
    copyTextToClipboard,
    getLocalIpAddress
}
