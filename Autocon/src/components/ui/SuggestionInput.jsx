import React from 'react';
import { Input } from './Input';

export function SuggestionInput({
  name,
  value,
  onChange,
  suggestions = [],
  label,
  placeholder,
  onApplySuggestion,
  helperText,
  ...props
}) {
  const filteredSuggestions = suggestions.filter(
    s => s && s !== value && s.toString().trim() !== ''
  );

  const handlePillClick = (suggestionValue) => {
    const event = {
      target: {
        name,
        value: suggestionValue
      }
    };
    onChange(event);
    if (onApplySuggestion) {
      onApplySuggestion(suggestionValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        {...props}
      />
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs text-[var(--on-surface-muted)] py-1">Suggestions:</span>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePillClick(suggestion)}
              className="
                px-3 py-1 text-xs font-medium rounded-full
                bg-[var(--primary-gradient)] text-white
                hover:opacity-80 transition-opacity duration-200
                cursor-pointer
              "
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {helperText && filteredSuggestions.length === 0 && (
        <p className="text-xs text-[var(--on-surface-muted)] -mt-4">{helperText}</p>
      )}
    </div>
  );
}