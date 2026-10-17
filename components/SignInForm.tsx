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
            <h2 className="font-serif text-2xl font-normal text-stone-900 dark:text-[#EDEBE8]">
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
    <form onSubmit={handleSubmit} noValidate className="romely-signin-form w-full max-w-md space-y-5 pb-10 lg:space-y-7 lg:pb-0">
      {/* Reduced top spacing so fields sit closer right beneath the image */}
      <div className="space-y-2 lg:space-y-10 pt-3">
        <SignInField
          id={IDENTIFIER_FIELD_ID}
          label="Email or Username"
          type="text"
          value={identifier}
          onChange={(value) => {
            setIdentifier(value);
            setErrors((current) => ({ ...current, identifier: undefined }));
          }}
          autoComplete="username"
          placeholder="you@example.com"
          error={errors.identifier}
        />

        <SignInField
          id={PASSWORD_FIELD_ID}
          label="Password"
          type={isPasswordVisible ? 'text' : 'password'}
          value={password}
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="inline-flex min-h-8 items-center gap-1.5 text-[10px] font-sans uppercase tracking-[0.18em] text-[#9C9893] transition-colors hover:text-[#C5A880] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880] cursor-pointer lg:min-h-0"
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
        className="romely-signin-cta group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#C5A880] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-stone-950 transition-all duration-300 hover:bg-[#D8BB91] hover:shadow-[0_14px_34px_rgba(197,168,128,0.28)] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer lg:min-h-0 lg:py-3.5"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <KeyRound className="h-3.5 w-3.5" />
            <span>Enter the Compendium</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 border-t border-stone-200 pt-2 text-[10px] font-sans text-stone-700 dark:border-white/10 dark:text-[#C9C4BE] lg:border-white/10 lg:pt-5 lg:text-[11px] lg:text-[#9C9893]">
        <button
          type="button"
          onClick={handleForgoPassword}
          className="min-h-8 text-left uppercase tracking-[0.16em] transition-colors hover:text-[#C5A880] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880] cursor-pointer lg:min-h-0"
        >
          Forgot password?
        </button>
        <Link
          href="/sign-up"
          className="inline-flex min-h-8 items-center text-right uppercase tracking-[0.16em] transition-colors hover:text-[#C5A880] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880] cursor-pointer lg:hidden"
        >
          Request an invitation
        </Link>
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-stone-200 bg-[#F4EFE7] p-6 shadow-[0_12px_30px_rgba(73,58,42,0.06)] dark:border-white/10 dark:bg-[#151519] dark:shadow-none lg:block">
        <h2 className="mb-3 font-serif text-2xl font-light text-stone-900 dark:text-[#EDEBE8]">
          A quieter way to keep the places that stay with you.
        </h2>
        <ul className="space-y-2 text-xs text-stone-600 dark:text-[#9C9893]">
          <li>• Saved itineraries that travel with you across devices</li>
          <li>• Curators’ field notes released ahead of publication</li>
        </ul>
      </div>
    </form>
  );
}