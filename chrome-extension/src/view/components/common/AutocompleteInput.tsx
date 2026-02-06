import React from 'react';

export default function AutocompleteInput({ value, getChangeAction, suggestions }: {
    value: string,
    getChangeAction: (v: string) => any,
    suggestions?: string[]
}) {
    const [highlightIndex, setHighlightIndex] = React.useState(-1);
    const [hideSuggestions, setHideSuggestions] = React.useState(false);

    const handleChange = (newValue: string) => {
        const result = getChangeAction(newValue)
        if (result instanceof Promise) {
            result.catch(err => console.error('Change error:', err))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!suggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                    handleChange(suggestions[highlightIndex]);
                    setHideSuggestions(true);
                    setHighlightIndex(-1);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setHideSuggestions(true);
                setHighlightIndex(-1);
                break;
        }
    };

    return (
        <span className='autocomplete-container'>
            <input value={value} onChange={(e) => {
                handleChange(e.target.value)
                setHideSuggestions(false)
            }} onBlur={() => {
                setHideSuggestions(true)
            }} onKeyDown={handleKeyDown} />
            {!hideSuggestions && suggestions && suggestions.length > 0 && (
                <div className='autocomplete-suggestions'>
                    {suggestions.map((s, i) => (
                        <div key={i} className={highlightIndex === i ? 'autocomplete-suggestion-highlight' : ''} onClick={() => {
                            handleChange(s);
                            setHideSuggestions(true);
                            setHighlightIndex(-1);
                        }}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </span>
    );
}
