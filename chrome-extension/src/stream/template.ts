import { StreamRenderObject } from "./data"
import FormulaParser from "./formulaParser"
import Mustache from "mustache";
import DOMPurify from "dompurify";

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
    const safeTags = new Set(['div', 'img', 'b', 'table', 'thead', 'tbody', 'tr', 'th', 'td'])
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

const _getCustomUsedVariables = (template: string) => Array.from(template.matchAll(/\{(.*?)\}/g)).map(m => m[1])

function _customRenderTemplate(template: string, variables: any): string {
    const context: { name?: string, value: any, loop?: RegExpExecArray[] }[] = [ { value: variables} ]
    const resultPart = []
    const unmatched = []
    const _eval = (x: string): string => x.split('.').reduce((acc, key) => acc?.[key], context.at(-1).value)
    const process = (match: RegExpExecArray) => {
        const lastContext = context.at(-1)
        if (lastContext.loop) {
            if (match[1]?.startsWith('/') && lastContext.name === match[1].slice(1)) {
                context.pop();
                for (const elem of lastContext.value) {
                    context.push({ value: elem });
                    const contextLength = context.length;
                    for (const loopMatch of lastContext.loop) {
                        process(loopMatch);
                    }
                    if (context.length > contextLength) {
                        unmatched.push(context.at(-1).name);
                        context.pop();
                    }
                    context.pop();
                }
            } else {
                lastContext.loop.push(match);
            }
        } else if (match[1]?.startsWith('#')) {
            const name = match[1].slice(1);
            const value = _eval(name);
            context.push({ name, value, ...Array.isArray(value) && { loop: [] } });
        } else if (match[1]?.startsWith('/')) {
            if (lastContext.name === match[1].slice(1)) {
                context.pop();
            } else {
                resultPart.push(`Unknown closing template tag: ${match[1]}`);
            }
        } else if (match[1]) {
            const value = match[1] === '.' ? lastContext.value : _eval(match[1]);
            resultPart.push(typeof value === 'object' ? JSON.stringify(value) : value);
        } else if (match[0] === '{{') {
            resultPart.push('{');
        } else if (match[0] === '}}') {
            resultPart.push('}');
        } else {
            resultPart.push(match[0]);
        }
    }
    Array.from(template.matchAll(/\{\{|\}\}|\{([^{].*?)\}|[^{}]+/g)).forEach(m => process(m));
    if (context.length > 1) {
        resultPart.push(`Missing closing template tag: ${context.splice(1, 0).map(c => `#${c.name}`).join(', ')}`);
    }
    return DOMPurify.sanitize(resultPart.join(''))
}

function _renderTemplate(template: string, variables: any): string {
    try {
        return Mustache.render(template, variables)
    } catch (e) {
        return `<p>${e}</p>`
    }
}

function renderHtmlTemplate(template: string, variables: any): string {
    const html = _renderTemplate(template, variables)
    return DOMPurify.sanitize(html)
}

function renderCssTemplate(template: string, variables: any): string {
    const css = _renderTemplate(template, variables)
    return DOMPurify.sanitize(css, {
        ALLOWED_ATTR: [], // No attributes in this case
        ALLOWED_TAGS: [], // No tags, just CSS rules
    });
}

export {
    renderHtmlTemplate,
    renderCssTemplate,
    computeFormulas
}
