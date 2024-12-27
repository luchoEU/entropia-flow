import { StreamRenderVariables } from "./data"

function _checkSafeTemplate(template: string) {
    // check that the template only contains safe html
    const safeTags = new Set(['div', 'img', 'b'])
    const safeAttributes = new Set(['style', 'src', 'alt'])
    const unsafe = new Set<string>()
    const regex = /<(\w+)([^>]*)>/g
    let match: RegExpExecArray
    while ((match = regex.exec(template)) !== null) {
    const [, tag, attributes] = match
    if (!safeTags.has(tag)) {
        unsafe.add(tag)
    } else {
        const attrRegex = /(\w+)=/g
        let attrMatch: RegExpExecArray
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
            const attrName = attrMatch[1]
            if (!safeAttributes.has(attrName)) {
                unsafe.add(tag)
                break
            }
        }
    }
    }
    if (unsafe.size > 0) {
        throw new Error(`template contains unsafe html tags or attributes: ${Array.from(unsafe).join(', ')}`)
    }
}

interface HtmlTemplateData {
    name: string
    html: string
    size: {
        width: number
        height: number
    }
}

interface HtmlTemplateIndirectData {
    n: string // name (from)
    v: string // value (to)
}

class HtmlTemplate {
    private data: HtmlTemplateData
    private usedVariables: string[]

    constructor(data: HtmlTemplateData) {
        _checkSafeTemplate(data.html)
        this.data = data
        this.usedVariables = Array.from(this.data.html.matchAll(/\{(.*?)\}/g)).map(m => m[1])
    }

    render(variables: StreamRenderVariables): string {
        return Object.keys(variables).reduce((acc, key) => {
            const v = _indirectList.includes(key) ? _indirectMap[variables[key]] : variables[key]
            return acc.replace(`{${key}}`, v)
          }, this.data.html)
    }

    getData(): HtmlTemplateData {
        return this.data
    }

    getUsedVariables(): string[] {
        return this.usedVariables
    }

    getContainerStyle() {
        return this.data.size
    }
}

const _templates = new Map<string, HtmlTemplate>()
let _indirectList = [ ] // list of variable names that are indirect
const _indirectMap = { } // map from value to the indirect value

const templateManager: HtmlTemplateManager = {
    add: (data: HtmlTemplateData) => {
        _templates.set(data.name, new HtmlTemplate(data))
    },
    get: (name: string): HtmlTemplate => _templates.get(name),
    addIndirect: (data: HtmlTemplateIndirectData): string => {
        _indirectMap[data.n] = data.v
        return data.n
    },
    getIndirect: (name: string): string => _indirectMap[name],
    getIndirectNames: () => _indirectList,
    setIndirectNames: (list: string[]) => {
        _indirectList = list
    }
}

interface HtmlTemplateManager {
    add(data: HtmlTemplateData)
    get(name: string): HtmlTemplate
    addIndirect(data: HtmlTemplateIndirectData): string
    getIndirect(name: string): string
    getIndirectNames(): string[]
    setIndirectNames(list: string[])
}

export default HtmlTemplate
export {
    HtmlTemplateData,
    HtmlTemplateIndirectData,
    HtmlTemplateManager,
    templateManager
}
