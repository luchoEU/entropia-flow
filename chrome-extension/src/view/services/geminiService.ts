const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemini-2.0-flash'

export interface GeminiMessage {
    role: 'user' | 'model'
    parts: { text: string }[]
}

export interface GeminiRequestBody {
    system_instruction?: { parts: { text: string }[] }
    contents: GeminiMessage[]
    generationConfig?: {
        temperature?: number
        responseMimeType?: string
    }
}

export interface GeminiError {
    code: number
    message: string
    status: string
}

export class GeminiApiError extends Error {
    constructor(
        public readonly code: number,
        public readonly status: string,
        message: string
    ) {
        super(message)
        this.name = 'GeminiApiError'
    }
}

/**
 * Calls the Gemini API with the given system prompt, conversation history, and user message.
 * Returns the raw text of the model's reply.
 */
export async function callGemini(
    apiKey: string,
    systemPrompt: string,
    history: GeminiMessage[],
    userMessage: string,
    modelName: string = 'gemini-3.5-flash'
): Promise<string> {
    const url = `${GEMINI_API_BASE}/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`

    const body: GeminiRequestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: GeminiError }
        const apiErr = err.error
        throw new GeminiApiError(
            apiErr?.code ?? response.status,
            apiErr?.status ?? 'UNKNOWN',
            apiErr?.message ?? `HTTP ${response.status}`
        )
    }

    const data = await response.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (text === undefined) {
        throw new GeminiApiError(0, 'EMPTY_RESPONSE', 'Gemini returned no text in the response')
    }
    return text
}
