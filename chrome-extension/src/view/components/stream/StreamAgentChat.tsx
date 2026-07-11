import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
    streamInAtom,
    streamRenderDataAtom,
    streamLayoutHistoryAtom,
    streamVariablesAtom,
    pushStreamHistoryAtom,
    undoStreamLayoutAtom,
    redoStreamLayoutAtom,
    setStreamFormulaJavaScriptAtom,
    setStreamHtmlTemplateAtom,
    setStreamCssTemplateAtom,
    setStreamUserParametersAtom,
    setStreamUserImagesAtom,
    setStreamDescriptionAtom,
} from '../../application/atoms/stream'
import { sendAgentMessage, AgentResponse, extractVarsFromRenderData } from '../../services/streamAgentService'
import { GeminiApiError } from '../../services/geminiService'
import { GeminiMessage } from '../../services/geminiService'
import ExpandableSection from '../common/ExpandableSection'
import { persistAgentChatState } from './streamAgentStorage'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY_STORAGE_KEY = 'stream-agent-gemini-api-key'

// ─────────────────────────────────────────────────────────────────────────────
// Local types
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: string
    role: 'user' | 'agent' | 'error'
    text: string
    response?: AgentResponse
    applied?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? ''
}

function saveApiKey(key: string) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
}

const MODEL_STORAGE_KEY = 'stream-agent-gemini-model'

function loadModel(): string {
    return localStorage.getItem(MODEL_STORAGE_KEY) ?? 'gemini-3.5-flash'
}

function saveModel(model: string) {
    localStorage.setItem(MODEL_STORAGE_KEY, model)
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function AgentMessageBubble({
    msg,
    onApply,
    onRetry,
}: {
    msg: ChatMessage
    onApply: (msg: ChatMessage) => void
    onRetry?: () => void
}) {
    const isUser = msg.role === 'user'
    const isError = msg.role === 'error'

    const changedFields = msg.response
         ? [
               msg.response.formulaJavaScript !== undefined && 'JavaScript',
               msg.response.htmlTemplate !== undefined && 'HTML',
               msg.response.cssTemplate !== undefined && 'CSS',
               msg.response.images !== undefined && 'Images',
               msg.response.parameters !== undefined && 'Parameters',
               msg.response.description !== undefined && 'Description',
           ].filter(Boolean)
         : []

    return (
        <div className={`stream-agent-message stream-agent-message--${msg.role}`}>
            <div className="stream-agent-message-text">{msg.text}</div>
            {msg.response && !msg.applied && changedFields.length > 0 && (
                <div className="stream-agent-message-actions">
                    <span className="stream-agent-fields-badge">
                        {changedFields.join(', ')}
                    </span>
                    <button
                        className="stream-agent-apply-btn"
                        title="Apply this response to the layout (replaces existing content)"
                        onClick={() => onApply(msg)}
                    >
                        ✅ Apply
                    </button>
                </div>
            )}
            {isError && onRetry && (
                <div className="stream-agent-message-actions">
                    <button
                        className="stream-agent-retry-btn"
                        title="Retry sending this request"
                        onClick={onRetry}
                    >
                        🔄 Retry
                    </button>
                </div>
            )}
            {msg.applied && (
                <div className="stream-agent-applied-badge">✅ Applied</div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

function StreamAgentChat({ layoutId }: { layoutId: string }) {
    // ── Atoms ─────────────────────────────────────────────────────────────────
    const streamIn = useAtomValue(streamInAtom)
    const streamRenderData = useAtomValue(streamRenderDataAtom)
    const historyMap = useAtomValue(streamLayoutHistoryAtom)
    const streamVariables = useAtomValue(streamVariablesAtom)

    const pushHistory = useSetAtom(pushStreamHistoryAtom)
    const undoLayout = useSetAtom(undoStreamLayoutAtom)
    const redoLayout = useSetAtom(redoStreamLayoutAtom)
    const setFormula = useSetAtom(setStreamFormulaJavaScriptAtom)
    const setHtml = useSetAtom(setStreamHtmlTemplateAtom)
    const setCss = useSetAtom(setStreamCssTemplateAtom)
    const setParameters = useSetAtom(setStreamUserParametersAtom)
    const setImages = useSetAtom(setStreamUserImagesAtom)
    const setStreamDescription = useSetAtom(setStreamDescriptionAtom)

    // ── Local state ───────────────────────────────────────────────────────────
    const [apiKey, setApiKeyState] = useState<string>(loadApiKey)
    const [model, setModel] = useState<string>(loadModel)
    const [showKey, setShowKey] = useState(false)
    const [input, setInput] = useState('')
    const [lastPrompt, setLastPrompt] = useState<string>('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const layout = streamIn.layouts[layoutId]
    const historyEntry = historyMap[layoutId]
    const canUndo = (historyEntry?.past.length ?? 0) > 0
    const canRedo = (historyEntry?.future.length ?? 0) > 0

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── Load state from localStorage on layout switch ──────────────────────────
    useEffect(() => {
        if (!layoutId) return

        const savedMsgs = localStorage.getItem(`stream-agent-chat-messages-${layoutId}`)
        setMessages(savedMsgs ? JSON.parse(savedMsgs) : [])

        const savedHist = localStorage.getItem(`stream-agent-chat-gemini-history-${layoutId}`)
        setGeminiHistory(savedHist ? JSON.parse(savedHist) : [])

        setLastPrompt(localStorage.getItem(`stream-agent-chat-last-prompt-${layoutId}`) ?? '')
    }, [layoutId])

    // ── Save state to localStorage ─────────────────────────────────────────────
    useEffect(() => {
        if (!layoutId) return
        persistAgentChatState(layoutId, messages, geminiHistory, lastPrompt)
    }, [layoutId, messages, geminiHistory, lastPrompt])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleApiKeyChange = useCallback((value: string) => {
        setApiKeyState(value)
        saveApiKey(value)
    }, [])

    const handleModelChange = useCallback((value: string) => {
        setModel(value)
        saveModel(value)
    }, [])

    const handleClearChat = useCallback(() => {
        setMessages([])
        setGeminiHistory([])
        setLastPrompt('')
        localStorage.removeItem(`stream-agent-chat-messages-${layoutId}`)
        localStorage.removeItem(`stream-agent-chat-gemini-history-${layoutId}`)
        localStorage.removeItem(`stream-agent-chat-last-prompt-${layoutId}`)
    }, [layoutId])

    const handleSend = useCallback(async (promptOverride?: string, isRetry: boolean = false) => {
        const trimmed = (promptOverride !== undefined ? promptOverride : input).trim()
        if (!trimmed || loading || !layout) return
        if (!apiKey.trim()) {
            setMessages(prev => [...prev, {
                id: generateId(),
                role: 'error',
                text: '⚠️ Please enter your Gemini API key above before sending a message.',
            }])
            return
        }

        setLastPrompt(trimmed)

        if (!isRetry) {
            // Remove previous error messages and append user message bubble
            setMessages(prev => [
                ...prev.filter(m => m.role !== 'error'),
                {
                    id: generateId(),
                    role: 'user',
                    text: trimmed,
                }
            ])
            setInput('')
        } else {
            // Simply remove the previous error message bubble
            setMessages(prev => prev.filter(m => m.role !== 'error'))
        }

        setLoading(true)

        try {
            const availableVars = extractVarsFromRenderData(
                streamRenderData.commonData,
                streamRenderData.layoutData[layoutId] ?? {}
            )

            const varDescMap: Record<string, string> = {}
            Object.values(streamVariables.single).flat().forEach(v => {
                if (v.description) varDescMap[v.name] = v.description
            })
            Object.values(streamVariables.temporal).flat().forEach(v => {
                if (v.description) varDescMap[v.name] = v.description
            })

            const { response, updatedHistory } = await sendAgentMessage(
                apiKey,
                trimmed,
                layout,
                streamRenderData.commonData,
                streamRenderData.layoutData[layoutId] ?? {},
                varDescMap,
                geminiHistory,
                model
            )

            setGeminiHistory(updatedHistory)

            const agentMsg: ChatMessage = {
                id: generateId(),
                role: 'agent',
                text: response.explanation,
                response,
            }
            setMessages(prev => [...prev, agentMsg])
        } catch (err) {
            const errorText = err instanceof GeminiApiError
                ? `❌ Gemini error ${err.code} (${err.status}): ${err.message}`
                : `❌ ${err instanceof Error ? err.message : String(err)}`
            setMessages(prev => [...prev, {
                id: generateId(),
                role: 'error',
                text: errorText,
            }])
        } finally {
            setLoading(false)
        }
    }, [input, loading, layout, apiKey, streamRenderData, layoutId, geminiHistory])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    const handleApply = useCallback((msg: ChatMessage) => {
        if (!msg.response || !layout) return

        // Snapshot current state before applying
        pushHistory(layoutId, {
            formulaJavaScript: layout.formulaJavaScript,
            htmlTemplate: layout.htmlTemplate,
            cssTemplate: layout.cssTemplate,
            images: layout.images ? [...layout.images] : undefined,
            parameters: layout.parameters ? [...layout.parameters] : undefined,
            description: layout.description,
        })

        const { response } = msg

        // Apply JavaScript
        if (response.formulaJavaScript !== undefined) {
            setFormula(layoutId, response.formulaJavaScript)
        }

        // Apply HTML
        if (response.htmlTemplate !== undefined) {
            setHtml(layoutId, response.htmlTemplate)
        }

        // Apply CSS
        if (response.cssTemplate !== undefined) {
            setCss(layoutId, response.cssTemplate)
        }

        // Apply Images
        if (response.images !== undefined) {
            const newImages = response.images.map((img, index) => ({
                id: index + 1,
                name: img.name,
                value: img.value,
                description: img.description ?? '',
            }))
            setImages(layoutId, newImages)
        }

        // Apply Parameters
        if (response.parameters !== undefined) {
            const newParams = response.parameters.map((param, index) => ({
                id: index + 1,
                name: param.name,
                value: param.value,
                description: param.description ?? '',
            }))
            setParameters(layoutId, newParams)
        }

        // Apply Description
        if (response.description !== undefined) {
            setStreamDescription(layoutId, response.description)
        }

        // Mark the message as applied
        setMessages(prev =>
            prev.map(m => m.id === msg.id ? { ...m, applied: true } : m)
        )
    }, [layout, layoutId, pushHistory, setFormula, setHtml, setCss, setImages, setParameters, setStreamDescription])

    const handleUndo = useCallback(() => { undoLayout(layoutId) }, [undoLayout, layoutId])
    const handleRedo = useCallback(() => { redoLayout(layoutId) }, [redoLayout, layoutId])

    if (!layout) return <></>

    return (
        <ExpandableSection
            selector='StreamEditor-agent-chat'
            title='🤖 Agent'
            subtitle='Describe what you want and the AI will generate the layout parts'
            className='stream-layout'
        >
            <div className="stream-agent-chat">
                {/* API Key row */}
                <div className="stream-agent-apikey-row">
                    <label htmlFor="stream-agent-apikey" className="stream-agent-apikey-label">
                        Gemini API Key
                    </label>
                    <div className="stream-agent-apikey-input-wrap">
                        <input
                            id="stream-agent-apikey"
                            type={showKey ? 'text' : 'password'}
                            className="stream-agent-apikey-input"
                            placeholder="AIzaSy..."
                            value={apiKey}
                            onChange={e => handleApiKeyChange(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                        <button
                            className="stream-agent-key-toggle"
                            title={showKey ? 'Hide key' : 'Show key'}
                            onClick={() => setShowKey(s => !s)}
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <label htmlFor="stream-agent-model" className="stream-agent-apikey-label">
                        Model
                    </label>
                    <select
                        id="stream-agent-model"
                        className="stream-agent-model-select"
                        value={model}
                        onChange={e => handleModelChange(e.target.value)}
                        onClick={e => e.stopPropagation()}
                    >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                        <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                        <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    </select>

                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stream-agent-key-link"
                        title="Get a free Gemini API key from Google AI Studio"
                    >
                        Get key ↗
                    </a>
                </div>

                {/* Undo / Redo bar */}
                <div className="stream-agent-history-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            className="stream-agent-history-btn"
                            disabled={!canUndo}
                            onClick={handleUndo}
                            title={canUndo ? `Undo last apply (${historyEntry.past.length} available)` : 'Nothing to undo'}
                        >
                            ↩ Undo
                        </button>
                        <button
                            className="stream-agent-history-btn"
                            disabled={!canRedo}
                            onClick={handleRedo}
                            title={canRedo ? `Redo (${historyEntry.future.length} available)` : 'Nothing to redo'}
                        >
                            Redo ↪
                        </button>
                        {(canUndo || canRedo) && (
                            <span className="stream-agent-history-info">
                                {historyEntry.past.length} past · {historyEntry.future.length} future
                            </span>
                        )}
                    </div>
                    <button
                        className="stream-agent-clear-btn"
                        onClick={handleClearChat}
                        title="Clear conversation history and reset context"
                    >
                        🗑️ Clear Chat
                    </button>
                </div>

                {/* Message thread */}
                {messages.length > 0 && (
                    <div className="stream-agent-messages">
                        {messages.map(msg => (
                            <AgentMessageBubble
                                key={msg.id}
                                msg={msg}
                                onApply={handleApply}
                                onRetry={() => handleSend(lastPrompt, true)}
                            />
                        ))}
                        {loading && (
                            <div className="stream-agent-message stream-agent-message--agent stream-agent-thinking">
                                <span className="stream-agent-spinner" />
                                Thinking…
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
                {messages.length === 0 && !loading && (
                    <div className="stream-agent-empty">
                        Type a prompt below to generate layout parts.<br />
                        <em>Example: "Show my PED balance in large white text on a dark background"</em>
                    </div>
                )}

                {/* Input row */}
                <div className="stream-agent-input-row">
                    <textarea
                        className="stream-agent-textarea"
                        placeholder="Describe the layout you want… (Enter to send, Shift+Enter for newline)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        disabled={loading}
                    />
                    <button
                        className="stream-agent-send-btn"
                        disabled={loading || !input.trim()}
                        onClick={() => handleSend()}
                        title="Send message (Enter)"
                    >
                        {loading ? <span className="stream-agent-spinner" /> : '▶'}
                    </button>
                </div>
            </div>
        </ExpandableSection>
    )
}

export default StreamAgentChat
