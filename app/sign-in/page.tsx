import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { SignInForm } from '@/components/SignInForm';

export const metadata: Metadata = {
  title: 'Member Sign In — ROMELY',
  description:
    'Enter the ROMELY members’ compendium: saved itineraries, curators’ field notes, and private editorial dispatches.',
};

const FEATURED_IMAGE = '/images/hero_paris.jpg';

const MEMBERSHIP_PRIVILEGES = [
  'Saved itineraries that travel with you across devices',
  'Curators’ field notes released ahead of publication',
  'Private dispatches from our city correspondents',
];

export default function SignInPage() {
  return (
    /* تم إزالة min-h من الحاوية الرئيسية لمنع تمدد الصفحة وطرد المحتوى للأعلى بمسافة فارغة */
    <div className="relative w-full overflow-x-hidden bg-[#FAF8F5] text-stone-900 transition-colors duration-200 dark:bg-[#0A0A0C] dark:text-[#EDEBE8]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C5A880]/40 to-transparent" />

      <div
        aria-hidden="true"
        className="romely-aura pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C5A880]/15 dark:bg-[#C5A880]/20 blur-[150px]"
      />

      <div className="romely-signin-brand absolute top-3 left-4 z-20 flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-[#C5A880] lg:left-6 lg:top-6 lg:text-sm">
        <ArrowLeft className="h-4 w-4" />
        <Link href="/" className="transition-opacity hover:opacity-75 hover:underline">
          Back to ROMELY
        </Link>
      </div>

      {/* تم تعديل الحاوية لتبدأ المحتوى بشكل متناسق وإزالة الفراغات المبالغ بها في الهوامش السفلية */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 content-start justify-items-center gap-0 px-4 pt-12 pb-8 sm:px-8 lg:min-h-0 lg:grid-cols-2 lg:items-stretch lg:content-normal lg:justify-items-stretch lg:gap-16 lg:px-6 lg:py-20">

        {/* 1. العنوان والوصف */}
        <section className="order-1 mt-6 flex w-full flex-col items-center text-center lg:order-1 lg:mt-0 lg:items-start lg:justify-center lg:gap-6 lg:text-left">
          <div className="w-full space-y-1 lg:space-y-0">
            <h2 className="romely-signin-copy w-full text-center font-serif text-[2rem] font-light leading-none text-stone-900 dark:text-white lg:text-left lg:text-3xl">
              Member Sign In
            </h2>

            <p className="romely-signin-copy mx-auto mt-1.5 w-full max-w-sm text-center text-[13px] leading-relaxed text-stone-600 dark:text-[#9C9893] lg:mx-0 lg:mt-0 lg:max-w-md lg:text-left lg:text-sm">
              Access your saved itineraries, curators’ field notes, and private dispatches.
            </p>
          </div>

          {/* النموذج يظهر هنا في تخطيط اللابتوب فقط */}
          <div className="hidden w-full max-w-md lg:order-2 lg:block">
            <SignInForm />
          </div>

          <div className="hidden items-center gap-2 text-sm lg:order-3 lg:flex">
            <span className="text-[#C5A880]">Not a member yet?</span>
            <Link href="/sign-up" className="underline text-[#C5A880] hover:text-[#D8BB91]">
              Request an invitation
            </Link>
          </div>
        </section>

        {/* 2. الصورة: تحت العنوان مباشرة على الجوال */}
        <section className="romely-signin-image relative order-2 mt-4 aspect-[4/3] w-full max-w-md shrink-0 overflow-hidden rounded-[40px] border border-stone-200 shadow-sm dark:border-white/10 lg:order-2 lg:mt-0 lg:aspect-auto lg:min-h-[720px] lg:max-w-none lg:rounded-3xl">
          <Image
            src={FEATURED_IMAGE}
            alt="Haussmann facades along the Seine at golden hour"
            fill
            priority
            className="object-cover opacity-85 dark:opacity-50"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/90 via-[#FAF8F5]/40 to-transparent dark:from-[#0A0A0C] dark:via-[#0A0A0C]/80 dark:to-[#0A0A0C]/40" />

          <div className="relative flex h-full min-h-0 flex-col justify-between p-4 sm:p-5 lg:min-h-[620px] lg:p-8">
            <div className="flex flex-col items-center gap-1 lg:items-start lg:gap-2">
              <span className="font-serif text-base font-medium tracking-[0.18em] text-stone-900 dark:text-white lg:text-2xl lg:tracking-widest">
                ROMELY
              </span>
              <span className="text-[7px] font-sans uppercase tracking-[0.28em] text-[#C5A880] lg:text-[10px]">
                Curated Guides
              </span>
            </div>

            <div className="hidden space-y-6 lg:block">
              <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.24em] text-[#C5A880]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Members’ Entrance</span>
              </div>

              <h2 className="max-w-md font-serif text-3xl font-light leading-snug text-stone-900 dark:text-white sm:text-4xl">
                A quieter way to keep the places that stay with you.
              </h2>

              <ul className="space-y-2.5">
                {MEMBERSHIP_PRIVILEGES.map((privilege) => (
                  <li
                    key={privilege}
                    className="flex items-start gap-2.5 text-xs leading-relaxed font-sans text-stone-700 dark:text-[#9C9893]"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C5A880]" />
                    <span>{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. النموذج على الجوال يأتي بعد الصورة */}
        <section className="order-3 mt-4 flex w-full max-w-md flex-col items-center lg:hidden">
          <SignInForm />

          <div className="-mt-12 flex items-center justify-center gap-2 pb-1 text-xs">
            <span className="text-[#C5A880]">Not a member yet?</span>
            <Link href="/sign-up" className="underline text-[#C5A880] hover:text-[#D8BB91]">
              Request an invitation
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
