import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

const mustache = {
    pattern: /{{.*?}}/,
    inside: {
        punctuation: /{{|}}/, // Highlight the curly braces
        variable: /[^{}]+/    // Highlight the inner content
    }
}
Prism.languages.insertBefore('css', 'selector', { mustache });
Prism.languages.insertBefore('markup', 'tag', { mustache });

const CodeEditor = (p: { language: 'html'|'css'|'javascript', readOnly: boolean, value: string, dispatchChange: (value: string) => any }) => {
    const prismLanguage = p.language === 'css' ? 'css' : p.language === 'javascript' ? 'javascript' : 'markup';
    const highlightCode = (code: string) => code && Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage)

    const handleChange = (value: string) => {
        const result = p.dispatchChange(value)
        if (result instanceof Promise) {
            result.catch(err => console.error('Code change error:', err))
        }
    }

    return (
        <div style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            maxHeight: '300px',
            overflow: 'auto',
        }}>
            <Editor
                value={p.value}
                onValueChange={handleChange}
                highlight={highlightCode}
                padding={10}
                readOnly={p.readOnly}
                style={{
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    backgroundColor: p.readOnly ? 'transparent' : 'white',
                }}
            />
        </div>
    );
};

export default CodeEditor;
