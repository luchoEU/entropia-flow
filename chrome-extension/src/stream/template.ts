import Mustache from "mustache";
import DOMPurify from "dompurify";

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

function getUsedVariablesInTemplate(template: string): Set<string> {
    const tokens = Mustache.parse(template);
    const variables = new Set<string>();

    function recurse(tokens: any[]) {
        for (const token of tokens) {
            const [type, value, start, end, subTokens] = token;

            if (type === 'name' || type === '#' || type === '^' || type === '&' || type === '{') {
                variables.add(value);
            }

            if (Array.isArray(subTokens)) {
                recurse(subTokens);
            }
        }
    }

    recurse(tokens);
    return variables;
}

export {
    renderHtmlTemplate,
    renderCssTemplate,
    getUsedVariablesInTemplate,
}
