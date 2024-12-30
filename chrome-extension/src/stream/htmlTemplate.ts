import { StreamRenderObject } from "./data"
import FormulaParser from "./formulaParser"

function _escapeHTML(str: string): string {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;', // Single quotes
        '`': '&#96;', // Backticks
    };
    return str.replace(/[&<>"'`]/g, (char) => map[char]);
}

function _checkSafeHtml(html: string): string {
    // check that the template and variables only contains safe html
    const safeTags = new Set(['div', 'img', 'b'])
    const safeAttributes = new Set(['style', 'src', 'alt'])
    const unsafe = new Set<string>()
    const regex = /<(\w+)([^>]*)>/g
    let match: RegExpExecArray
    while ((match = regex.exec(html)) !== null) {
        const [, tag, attributes] = match
        if (!safeTags.has(tag)) {
            unsafe.add(`<${tag}>`)
        } else {
            const attrRegex = /'[^']+'|"[^"]+"|(\w+)=/g
            let attrMatch: RegExpExecArray
            while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                const attrName = attrMatch[1]
                if (attrName && !safeAttributes.has(attrName)) {
                    unsafe.add(`<${tag} ${attrName}=...`)
                    break
                }
            }
        }
    }
    if (unsafe.size > 0) {
        console.log('Full unsafe HTML: ', html)
        return [
            'Unsafe html tags or attributes:',
            ...Array.from(unsafe).map(s => _escapeHTML(s)),
            'see console for full html'
        ].map(s => `<p>${s}</p>`).join('\n')
    }
    return html
}

function computeFormulas(obj: StreamRenderObject) {
    let v = JSON.parse(JSON.stringify(obj))
    let changed = true
    while (changed) {
        changed = false
        const parser = new FormulaParser(obj)
        v = Object.fromEntries(Object.entries(v).map(([key, value]) => {
            if (typeof value === 'string' && value.startsWith('=')) {
                const result = parser.evaluate(value.slice(1))
                changed = changed || result !== value
                return [key, result]
            }
            return [key, value]
        }))
    }
    return v
}

const getUsedVariables = (template: string) => Array.from(template.matchAll(/\{(.*?)\}/g)).map(m => m[1])

function renderHtmlTemplate(template: string, obj: StreamRenderObject, safeCheck = true): string {
    var variables = computeFormulas(obj)
    const html = Array.from(template.matchAll(/\{(.*?)\}|[^{]+/g)).map(t => t[1] ?
        t[1].split('.').reduce((acc, key) => acc[key], variables) : t[0]).join('')
    return safeCheck ? _checkSafeHtml(html) : html
}

export default renderHtmlTemplate
export {
    getUsedVariables,
    computeFormulas
}
