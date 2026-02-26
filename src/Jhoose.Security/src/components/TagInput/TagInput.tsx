import React, { useEffect, useMemo, useState } from 'react';
import './TagInput.css';

type TagInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
    id?: string;
    ariaLabel?: string;
};

const SPACE_DELAY_MS = 1000;

export const TagInput: React.FC<TagInputProps> = ({
    value,
    onChange,
    placeholder,
    className = '',
    disabled = false,
    label,
    id,
    ariaLabel,
}) => {
    const [draft, setDraft] = useState('');

    const tags = useMemo(() => splitTags(value), [value]);

    useEffect(() => {
        if (!draft.includes(' ')) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const { completed, remainder } = extractCompletedTags(draft);
            if (completed.length > 0) {
                const nextTags = [...tags, ...completed];
                onChange(nextTags.join(' '));
            }
            setDraft(remainder);
        }, SPACE_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [draft, onChange, tags]);

    const handleRemove = (index: number) => {
        const nextTags = tags.filter((_, tagIndex) => tagIndex !== index);
        onChange(nextTags.join(' '));
    };

    return (
        <div className={`tag-input ${className}`.trim()}>
            {label && (
                <label className="tag-input__label" htmlFor={id}>
                    {label}
                </label>
            )}
            <div className="tag-input__field">
                {tags.map((tag, index) => (
                    <button
                        key={`${tag}-${index}`}
                        type="button"
                        className="tag-input__tag"
                        onClick={() => handleRemove(index)}
                        disabled={disabled}
                        aria-label={`Remove ${tag}`}
                    >
                        {tag}
                        <span className="tag-input__tag-remove">&times;</span>
                    </button>
                ))}
                <input
                    id={id}
                    className="tag-input__input"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-label={ariaLabel ?? label}
                />
            </div>
        </div>
    );
};

function splitTags(value: string) {
    return value
        .split(' ')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

function extractCompletedTags(input: string) {
    const parts = input.split(' ');
    const completed = parts
        .slice(0, -1)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    const remainder = (parts[parts.length - 1] ?? '').trimStart();

    return { completed, remainder };
}
