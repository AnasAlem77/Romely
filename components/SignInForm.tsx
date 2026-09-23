'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { SignInField } from './SignInField';

type FormStatus = 'idle' | 'submitting' | 'notice';

interface FieldErrors {
  identifier?: string;
  password?: string;
}

const MIN_IDENTIFIER_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;
const SUBMIT_SETTLE_MS = 900;

const IDENTIFIER_FIELD_ID = 'member-identifier';
const PASSWORD_FIELD_ID = 'member-password';

/**
 * Member entrance form.
 *
 * Membership records are not yet wired to a backend, so a valid submission settles
 * into an honest activation notice rather than a dead end or a fabricated session.
 */
export function SignInForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [notice, setNotice] = useState('');

  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (identifier.trim().length < MIN_IDENTIFIER_LENGTH) {
      nextErrors.identifier = 'Enter the email address or username on your ROMELY membership.';
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Passwords are at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return nextErrors;
  };

  const showNotice = (message: string) => {
    setNotice(message);
    setStatus('notice');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (nextErrors.identifier || nextErrors.password) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');
    settleTimerRef.current = window.setTimeout(() => {
      showNotice(
        'Membership activation opens with the next edition. Nothing was transmitted and no session was created.'
      );
    }, SUBMIT_SETTLE_MS);
  };

  const handleForgoPassword = () => {
    showNotice(
      'Password recovery is issued by hand by the editorial desk. Write to members@romely.travel and a curator will respond within two days.'
    );
  };

  const handleRequestInvitation = () => {
    showNotice(
      'ROMELY is invitation-led. Send a note to members@romely.travel describing the cities you keep returning to, and the desk will reply.'
    );
  };

  const resetForm = () => {
    setNotice('');
    setStatus('idle');
    setPassword('');
  };

  if (status === 'notice') {
    return (
      <div className="romely-veil space-y-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C5A880]/40 bg-[#C5A880]/10">
            <Check className="h-4 w-4 text-[#C5A880]" />
          </span>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-normal text-[#EDEBE8]">
              Noted — the desk has your details.
            </h2>
            <p className="max-w-md text-sm leading-relaxed font-sans text-[#9C9893]">{notice}</p>
          </div>
        </div>

        <div className="h-px w-full romely-hairline bg-gradient-to-r from-[#C5A880]/50 via-[#C5A880]/15 to-transparent" />

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#C5A880] transition-opacity hover:opacity-75 cursor-pointer"
          >
            Return to the form
          </button>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-sans text-[#9C9893] transition-colors hover:text-[#EDEBE8]"
          >
            <span>Browse destinations</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <div className="space-y-6">
        <SignInField
          id={IDENTIFIER_FIELD_ID}
          label="Email or Username"
          type="text"
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
          placeholder="you@example.com"
          error={errors.identifier}
        />

        <SignInField
          id={PASSWORD_FIELD_ID}
          label="Password"
          type={isPasswordVisible ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-sans text-[#9C9893] transition-colors hover:text-[#C5A880] cursor-pointer"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span>{isPasswordVisible ? 'Hide' : 'Show'}</span>
            </button>
          }
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#C5A880] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-stone-950 transition-all duration-300 hover:bg-[#D8BB91] hover:shadow-[0_14px_34px_rgba(197,168,128,0.28)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying</span>
          </>
        ) : (
          <>
            <KeyRound className="h-3.5 w-3.5" />
            <span>Enter the Compendium</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] font-sans text-[#9C9893] sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleForgoPassword}
          className="text-left uppercase tracking-[0.16em] transition-colors hover:text-[#C5A880] cursor-pointer"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={handleRequestInvitation}
          className="text-left uppercase tracking-[0.16em] transition-colors hover:text-[#C5A880] cursor-pointer"
        >
          Request an invitation
        </button>
      </div>
    </form>
  );
}
