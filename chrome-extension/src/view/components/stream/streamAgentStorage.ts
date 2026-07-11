const STREAM_AGENT_MESSAGE_KEY = (layoutId: string) => `stream-agent-chat-messages-${layoutId}`
const STREAM_AGENT_HISTORY_KEY = (layoutId: string) => `stream-agent-chat-gemini-history-${layoutId}`
const STREAM_AGENT_LAST_PROMPT_KEY = (layoutId: string) => `stream-agent-chat-last-prompt-${layoutId}`

const MAX_STORED_MESSAGES = 24
const MAX_STORED_HISTORY = 12
const MAX_SERIALIZED_BYTES = 96 * 1024

interface AgentChatStorage {
    setItem(key: string, value: string): void
    removeItem(key: string): void
}

function getStorageJsonByteSize(value: unknown): number {
    return new Blob([JSON.stringify(value)]).size
}

function trimNewestItems<T>(items: T[], maxItems: number): T[] {
    if (items.length <= maxItems) return items
    return items.slice(items.length - maxItems)
}

function trimToSize<T>(items: T[], maxItems: number, maxBytes: number): T[] {
    let trimmed = trimNewestItems(items, maxItems)
    while (trimmed.length > 1 && getStorageJsonByteSize(trimmed) > maxBytes) {
        trimmed = trimmed.slice(Math.ceil(trimmed.length / 2))
    }
    return trimmed
}

function isQuotaExceededError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const err = error as DOMException & { code?: number }
    return err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22 || err.code === 1014
}

function safeSetItem(storage: AgentChatStorage, key: string, value: string) {
    try {
        storage.setItem(key, value)
    } catch (error) {
        if (!isQuotaExceededError(error)) throw error
        console.warn(`Stream agent storage quota exceeded for ${key}; dropping persisted data`)
        storage.removeItem(key)
    }
}

function persistAgentChatState(
    layoutId: string,
    messages: unknown[],
    geminiHistory: unknown[],
    lastPrompt: string,
    storage: AgentChatStorage = localStorage
) {
    const savedMessages = trimToSize(messages, MAX_STORED_MESSAGES, MAX_SERIALIZED_BYTES)
    const savedHistory = trimToSize(geminiHistory, MAX_STORED_HISTORY, MAX_SERIALIZED_BYTES)

    if (savedMessages.length > 0) {
        safeSetItem(storage, STREAM_AGENT_MESSAGE_KEY(layoutId), JSON.stringify(savedMessages))
    } else {
        storage.removeItem(STREAM_AGENT_MESSAGE_KEY(layoutId))
    }

    if (savedHistory.length > 0) {
        safeSetItem(storage, STREAM_AGENT_HISTORY_KEY(layoutId), JSON.stringify(savedHistory))
    } else {
        storage.removeItem(STREAM_AGENT_HISTORY_KEY(layoutId))
    }

    if (lastPrompt) {
        safeSetItem(storage, STREAM_AGENT_LAST_PROMPT_KEY(layoutId), lastPrompt)
    } else {
        storage.removeItem(STREAM_AGENT_LAST_PROMPT_KEY(layoutId))
    }
}

export {
    MAX_SERIALIZED_BYTES,
    MAX_STORED_HISTORY,
    MAX_STORED_MESSAGES,
    STREAM_AGENT_HISTORY_KEY,
    STREAM_AGENT_LAST_PROMPT_KEY,
    STREAM_AGENT_MESSAGE_KEY,
    persistAgentChatState,
    trimToSize,
}
