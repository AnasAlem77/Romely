'use client';

import React from 'react';

export interface SignInFieldProps {
  id: string;
  label: string;
  type: 'text' | 'password' | 'email';
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  error?: string;
  trailing?: React.ReactNode;
}

/**
 * A single member-entrance field: gold micro-label, underline rule that warms on
 * focus, and an inline error tied to the input through aria-describedby.
 */
export function SignInField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  trailing,
}: SignInFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="romely-signin-field space-y-0.5 lg:space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[10px] font-sans uppercase tracking-[0.22em] text-[#C5A880]/80"
        >
          {label}
        </label>
        {trailing}
      </div>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className="romely-field"
      />

      {error && (
        <p id={errorId} role="alert" className="romely-signin-feedback pt-1 text-[11px] font-sans text-[#D68474]">
          {error}
        </p>
      )}
    </div>
  );
}