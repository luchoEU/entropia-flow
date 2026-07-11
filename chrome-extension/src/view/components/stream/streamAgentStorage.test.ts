import { describe, expect, test } from '@jest/globals'
import { MAX_SERIALIZED_BYTES, persistAgentChatState, trimToSize } from './streamAgentStorage'

describe('stream agent storage', () => {
    test('should keep the newest entries when trimming oversized chat history', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = Array.from({ length: 40 }, (_, index) => ({
            id: `msg-${index}`,
            text: `message-${index}-${'x'.repeat(1024)}`,
        }))

        // ============================================================================
        // ACT
        // ============================================================================
        const trimmed = trimToSize(items, 24, MAX_SERIALIZED_BYTES)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(trimmed.length).toBeLessThanOrEqual(24)
        expect(trimmed[0].id).toBe('msg-16')
        expect(trimmed[trimmed.length - 1].id).toBe('msg-39')
    })

    test('should remove persisted chat data when localStorage rejects oversized writes', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const storageState = new Map<string, string>()
        const storage = {
            setItem: (key: string, value: string) => {
                if (value.length > 64) {
                    throw new DOMException('Quota exceeded', 'QuotaExceededError')
                }
                storageState.set(key, value)
            },
            removeItem: (key: string) => {
                storageState.delete(key)
            },
        }

        const messages = Array.from({ length: 10 }, (_, index) => ({
            id: `msg-${index}`,
            role: 'agent',
            text: `response-${index}-${'y'.repeat(32)}`
        }))
        const history = Array.from({ length: 10 }, (_, index) => ({
            role: 'model',
            parts: [{ text: `turn-${index}-${'z'.repeat(32)}` }]
        }))

        // ============================================================================
        // ACT
        // ============================================================================
        persistAgentChatState('layout-1', messages, history, 'prompt', storage)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(storageState.has('stream-agent-chat-messages-layout-1')).toBe(false)
        expect(storageState.has('stream-agent-chat-gemini-history-layout-1')).toBe(false)
        expect(storageState.get('stream-agent-chat-last-prompt-layout-1')).toBe('prompt')
    })
})
