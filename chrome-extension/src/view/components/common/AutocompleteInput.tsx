import React from 'react';
import { useDispatch } from 'react-redux';

export default function AutocompleteInput({ value, getChangeAction, suggestions }: {
    value: string,
    getChangeAction: (v: string) => any,
    suggestions?: string[]
}) {
    const dispatch = useDispatch()
    const [highlightIndex, setHighlightIndex] = React.useState(-1);
    const [hideSuggestions, setHideSuggestions] = React.useState(false);

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
                    dispatch(getChangeAction(suggestions[highlightIndex]));
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
                dispatch(getChangeAction(e.target.value))
                setHideSuggestions(false)
            }} onBlur={() => {
                setHideSuggestions(true)
            }} onKeyDown={handleKeyDown} />
            {!hideSuggestions && suggestions && suggestions.length > 0 && (
                <div className='autocomplete-suggestions'>
                    {suggestions.map((s, i) => (
                        <div key={i} className={highlightIndex === i ? 'autocomplete-suggestion-highlight' : ''} onClick={() => {
                            dispatch(getChangeAction(s));
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
