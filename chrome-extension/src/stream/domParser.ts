import React from 'react';

/**
 * Converts a native DOM node recursively into a React element tree
 */
export function domToReact(node: Node, keyIndex = { value: 0 }): React.ReactNode {
    keyIndex.value++;
    const key = `el-${keyIndex.value}`;

    if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    
    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();
    
    // Build React props
    const props: any = { key };
    
    // Copy attributes
    if (el.attributes) {
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            const name = attr.name;
            const value = attr.value;
            
            if (name === 'style') {
                const styleObj: Record<string, string> = {};
                value.split(';').forEach(styleProp => {
                    const idx = styleProp.indexOf(':');
                    if (idx !== -1) {
                        // camelCase style key conversion
                        const k = styleProp.slice(0, idx).trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        const v = styleProp.slice(idx + 1).trim();
                        styleObj[k] = v;
                    }
                });
                props.style = styleObj;
            } else if (name === 'class') {
                props.className = value;
            } else if (name.startsWith('data-')) {
                props[name] = value;
            } else {
                props[name] = value;
            }
        }
    }

    // Convert children recursively
    const children: React.ReactNode[] = [];
    el.childNodes.forEach(child => {
        const childNode = domToReact(child, keyIndex);
        if (childNode !== null) {
            children.push(childNode);
        }
    });

    return React.createElement(tagName, props, ...children);
}

/**
 * Parses an HTML string into a React element tree
 */
export function parseHtmlToReact(htmlString: string): React.ReactNode {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const children: React.ReactNode[] = [];
        const keyIndex = { value: 0 };
        
        doc.body.childNodes.forEach(child => {
            const childNode = domToReact(child, keyIndex);
            if (childNode !== null) {
                children.push(childNode);
            }
        });
        
        return children.length === 1 ? children[0] : React.createElement(React.Fragment, null, ...children);
    } catch (e) {
        console.error('Failed to parse HTML string to React:', e);
        return null;
    }
}
