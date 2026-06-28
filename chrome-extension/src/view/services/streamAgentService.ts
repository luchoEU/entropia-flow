import { callGemini, GeminiMessage } from './geminiService'
import { StreamUserImageVariable, StreamSavedLayout } from '../../stream/data'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentImageEntry {
    name: string
    value: string
    description?: string
}

export interface AgentParameterEntry {
    name: string
    value: string
    description?: string
}

export interface AgentResponse {
    /** Raw explanation the model gave (used as the chat "agent" message) */
    explanation: string
    /** If present, replaces the layout's formulaJavaScript */
    formulaJavaScript?: string
    /** If present, replaces the layout's htmlTemplate */
    htmlTemplate?: string
    /** If present, replaces the layout's cssTemplate */
    cssTemplate?: string
    /** If present, replaces the layout's images list */
    images?: AgentImageEntry[]
    /** If present, replaces the layout's parameters list */
    parameters?: AgentParameterEntry[]
}

// ── Variables Describer ──────────────────────────────────────────────────────

export function describeVariableTypes(
    commonData: Record<string, any>,
    layoutData: Record<string, any>,
    varDescMap: Record<string, string> = {}
): string {
    const merged = { ...commonData, ...layoutData }

    const getTypeString = (val: any, indent: string = ''): string => {
        if (val === null || val === undefined) return 'any'
        if (Array.isArray(val)) {
            if (val.length === 0) return 'Array'
            const item = val[0]
            if (typeof item === 'object' && item !== null) {
                const keys = Object.entries(item)
                    .map(([k, v]) => `${k}: ${typeof v}`)
                    .join(', ')
                return `Array of { ${keys} }`
            }
            return `Array of ${typeof item}`
        }
        if (typeof val === 'object') {
            const keys = Object.entries(val)
                .map(([k, v]) => `\n${indent}  ${k}: ${getTypeString(v, indent + '  ')}`)
                .join(',')
            return `{${keys}\n${indent}}`
        }
        return typeof val
    }

    return Object.entries(merged)
        .map(([key, value]) => {
            const desc = varDescMap[key] ? ` - *${varDescMap[key]}*` : ''
            return `- **${key}** (${getTypeString(value)})${desc}`
        })
        .join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(
    layout: StreamSavedLayout,
    commonData: Record<string, any>,
    layoutData: Record<string, any>,
    varDescMap: Record<string, string>
): string {
    const variablesDesc = describeVariableTypes(commonData, layoutData, varDescMap)

    return `You are an AI assistant that helps users create and modify stream overlay layouts for Entropia Universe, a sci-fi MMORPG.

## Layout Structure
A layout consists of:
- **formulaJavaScript**: JavaScript code that computes custom variables from inventory data. Available globals: \`items\` (array), \`item(name)\` (find by name), \`param(name)\` (read user parameter). Any variable declared at the root scope (e.g. \`const myVar = item('PED').quantity;\`) is automatically exposed to templates as \`{{myVar}}\`. Do NOT assign to an \`output\` object (e.g. do NOT do \`output.myVar = ...\`), as there is no pre-defined \`output\` object; simply declare root-level variables.
- **htmlTemplate**: Mustache template rendered as the overlay HTML. Uses \`{{variableName}}\` syntax.
- **cssTemplate**: Mustache template for the overlay CSS. Can reference \`{{variableName}}\` too.
- **images**: Array of {name, value, description} for user-defined images (value = URL or base64). Referenced in templates as \`{{img.name}}\`.
- **parameters**: Array of {name, value, description} for user-defined constant values. Referenced in templates as \`{{param.name}}\` and in JS via \`param('name')\`.

## Available Variables & Data Types
These variables are available for use in templates and formula calculations. Pay close attention to their structure:
${variablesDesc || '- (no data loaded yet)'}

## Current Layout State
\`\`\`json
${JSON.stringify({
    name: layout.name,
    formulaJavaScript: layout.formulaJavaScript ?? '',
    htmlTemplate: layout.htmlTemplate ?? '',
    cssTemplate: layout.cssTemplate ?? '',
    images: layout.images ?? [],
    parameters: layout.parameters ?? [],
}, null, 2)}
\`\`\`

## Response Format
You MUST respond with ONLY a valid JSON object (no markdown fences, no extra text) with this exact structure:
{
  "explanation": "Human-readable explanation of what you generated and why",
  "formulaJavaScript": "...JS code or omit this key if unchanged...",
  "htmlTemplate": "...HTML mustache template or omit if unchanged...",
  "cssTemplate": "...CSS mustache template or omit if unchanged...",
  "images": [...array or omit if unchanged...],
  "parameters": [...array or omit if unchanged...]
}

Only include keys for fields you are generating. Omit any key you do not want to change.
If a variable is a complex array of objects (like a list of log entries or events), you MUST write custom JavaScript inside the \`formulaJavaScript\` block to pre-process, filter, or aggregate it into flat computed values (e.g. \`const totalLoot = global.reduce(...)\`) so they can be easily displayed inside the Mustache templates.
Do NOT specify or override background properties (like background-color, background-image, background, opacity) on root layout containers in CSS, because the overlay background is configured separately by the user in the editor UI options.

## Interactive Elements & State Toggles (\`data-click\`)
The overlay engine supports element click handlers via the HTML \`data-click\` attribute. Use this to create interactive tabs, toggles, or reset buttons:
1. **Layout-Scoped State Toggles**: Use \`data-click="set:variableName=value"\`. When clicked, it stores the state value in the layout configuration and triggers a re-render. E.g.:
   - Single Set: \`<span class="tab" data-click="set:viewMode=detailed">Detailed View</span>\`
   - Multiple Sets in one click: Concatenate multiple assignments separated by a semi-colon (\`;\`) or ampersand (\`&\`). You may repeat the \`set:\` prefix on each part or omit it after the first:
     - Form 1 (repeating): \`data-click="set:pinnedName={{player}};set:viewMode=pinned"\`
     - Form 2 (omitted): \`data-click="set:pinnedName={{player}};viewMode=pinned"\`
2. **Reading the Toggle State**:
   - The state variable is automatically injected in the template and JavaScript formula scope.
   - In \`formulaJavaScript\`, it is available as a global variable (e.g. \`viewMode\`). You should declare root-level variables for rendering ease:
     \`const isDetailed = (viewMode === 'detailed');\`
3. **Reset Command**: Use \`data-click="flowSetLast"\` to trigger a new tracker activity session (resets timers, counts, and log offsets). E.g.:
   \`<img src="{{img.reset}}" data-click="flowSetLast" title="Reset Session" />\`
4. **Clipboard Copy**: Use \`data-click="copy:text_to_copy"\`. When clicked, it copies the specified string to the system clipboard. E.g.:
   \`<button data-click="copy:{{{gameLog.raw.0.message}}}">Copy Log Line</button>\`

## Custom Parameter Rules
- Any parameter accessed in Javascript via \`param('parameterName')\` or referenced in HTML/CSS templates via \`{{param.parameterName}}\` **MUST** be explicitly declared in the returned \`parameters\` array:
  \`\`\`json
  "parameters": [
    { "name": "parameterName", "value": "default_value_here", "description": "description_here" }
  ]
  \`\`\`
- If you use a parameter, you **MUST** include it in the \`parameters\` key of your JSON response so that it is created and saved in the layout.
The overlay should be visually clear, readable in a game environment (dark backgrounds work well).
Keep HTML minimal — one root div is fine. CSS should position elements absolutely if needed.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Response parser
// ─────────────────────────────────────────────────────────────────────────────

function parseAgentResponse(raw: string): AgentResponse {
    // The model is instructed to return raw JSON, but sometimes wraps it.
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        throw new Error('Model did not return a JSON object')
    }
    const parsed = JSON.parse(jsonMatch[0]) as Partial<AgentResponse>
    return {
        explanation: String(parsed.explanation ?? 'Done.'),
        formulaJavaScript: parsed.formulaJavaScript,
        htmlTemplate: parsed.htmlTemplate,
        cssTemplate: parsed.cssTemplate,
        images: parsed.images,
        parameters: parsed.parameters,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function sendAgentMessage(
    apiKey: string,
    userMessage: string,
    layout: StreamSavedLayout,
    commonData: Record<string, any>,
    layoutData: Record<string, any>,
    varDescMap: Record<string, string>,
    history: GeminiMessage[],
    modelName: string = 'gemini-3.5-flash'
): Promise<{ response: AgentResponse; updatedHistory: GeminiMessage[] }> {
    const systemPrompt = buildSystemPrompt(layout, commonData, layoutData, varDescMap)
    const rawText = await callGemini(apiKey, systemPrompt, history, userMessage, modelName)

    const response = parseAgentResponse(rawText)

    const updatedHistory: GeminiMessage[] = [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: rawText }] },
    ]

    return { response, updatedHistory }
}

export function extractVarsFromRenderData(
    commonData: Record<string, any>,
    layoutData: Record<string, any>
): string[] {
    const flatten = (obj: Record<string, any>, prefix = ''): string[] =>
        Object.entries(obj).flatMap(([k, v]) => {
            const key = prefix ? `${prefix}.${k}` : k
            if (v && typeof v === 'object' && !Array.isArray(v)) return flatten(v as Record<string, any>, key)
            return [key]
        })
    return [...new Set([...flatten(commonData), ...flatten(layoutData)])]
}
