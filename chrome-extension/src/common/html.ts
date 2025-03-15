function encodeHTML(str: string): string {
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

function decodeHTML(str: string): string {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&')
               .replace(/&#91;/g, '[')
               .replace(/&#93;/g, ']')
               .replace(/&#96;/g, '`');
};

export {
    encodeHTML,
    decodeHTML
}
