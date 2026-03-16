import { Component, trace } from "../common/trace"

/// PLAYER READER ///

class PlayerReader {
    public getAvatarName(): string | undefined {
        // Primary: extract from SvelteKit bootstrap data embedded in the page
        const scripts = document.querySelectorAll('script:not([src])')
        for (let i = 0; i < scripts.length; i++) {
            const match = scripts[i].textContent?.match(/avatarName\s*:\s*"([^"]+)"/)
            if (match) {
                trace(Component.PlayerReader, 'avatarName:', match[1])
                return match[1]
            }
        }

        // Fallback: first name from navbar trigger
        const triggerName = document.querySelector('.trigger-name') as HTMLElement
        if (triggerName?.innerText) {
            trace(Component.PlayerReader, 'fallback triggerName:', triggerName.innerText.trim())
            return triggerName.innerText.trim()
        }

        trace(Component.PlayerReader, 'avatarName not found')
        return undefined
    }
}

export {
    PlayerReader
}
