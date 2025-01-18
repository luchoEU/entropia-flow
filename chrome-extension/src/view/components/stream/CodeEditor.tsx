import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import { useDispatch } from 'react-redux';

const CodeEditor = (p: { language: 'html'|'css', readOnly: boolean, value: string, dispatchChange: (value: string) => any }) => {
    const dispatch = useDispatch()

    const highlightCode = p.language === 'css' ?
        (code: string) => Prism.highlight(code, Prism.languages.css, 'css') :
        (code: string) => Prism.highlight(code, Prism.languages.markup, 'markup');

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
            <Editor
                value={p.value}
                onValueChange={(v) => { dispatch(p.dispatchChange(v)) }}
                highlight={highlightCode}
                padding={10}
                readOnly={p.readOnly}
                style={{
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: p.readOnly ? 'transparent' : 'white',
                }}
            />
        </div>
    );
};

export default CodeEditor;
