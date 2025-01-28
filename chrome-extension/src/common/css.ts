function toKebabCase(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
}

function toCamelCase(kebabCase: string): string {
    return kebabCase.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export { toKebabCase, toCamelCase }
