"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { isValidHexColor, normalizeHexColor } from './editorUtils';

export function ColorPickerField({ value, onChange, disabled = false, className = '' }) {
  const safeValue = isValidHexColor(value) ? value : normalizeHexColor(value, '#FFFFFF');
  const inputValue = safeValue.toLowerCase();
  const handleColorChange = useCallback((event) => {
    const normalizedNext = normalizeHexColor(event.target.value, safeValue);

    if (normalizedNext === safeValue) {
      return;
    }

    onChange?.({
      target: {
        value: normalizedNext,
      },
    });
  }, [onChange, safeValue]);

  return (
    <label
      className={`relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${className}`}
    >
      <span
        className="block h-full w-full rounded-xl border border-slate-100 shadow-inner"
        style={{ backgroundColor: safeValue }}
      />
      <input
        type="color"
        value={inputValue}
        onChange={handleColorChange}
        disabled={disabled}
        className={`absolute inset-0 h-full w-full opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
    </label>
  );
}

export function HexColorInput({
  value,
  onValidColorChange,
  onSubmit,
  placeholder = '#111827',
  disabled = false,
  className = '',
}) {
  const normalizedValue = isValidHexColor(value) ? value.toUpperCase() : normalizeHexColor(value, placeholder).toUpperCase();
  const [draft, setDraft] = useState(normalizedValue);

  useEffect(() => {
    setDraft(normalizedValue);
  }, [normalizedValue]);

  const commitValue = useCallback(() => {
    const normalizedDraft = normalizeHexColor(draft, normalizedValue).toUpperCase();
    setDraft(normalizedDraft);
    if (isValidHexColor(normalizedDraft)) {
      onValidColorChange?.(normalizedDraft);
    }
  }, [draft, normalizedValue, onValidColorChange]);

  return (
    <input
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(event) => {
        const nextValue = event.target.value.toUpperCase();
        setDraft(nextValue);
        if (isValidHexColor(nextValue)) {
          onValidColorChange?.(nextValue);
        }
      }}
      onBlur={commitValue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitValue();
          onSubmit?.();
        }
      }}
      className={`h-12 w-[180px] max-w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-orange-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      placeholder={placeholder}
    />
  );
}
