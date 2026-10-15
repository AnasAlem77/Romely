'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { InfoPageShell } from '@/components/InfoPageShell';

const questions = [
  ['What is Romely?', 'Romely is a curated travel-discovery guide for destinations, sanctuaries, landmarks, and editorial stories.'],
  ['How do I save a place?', 'Use the save control on a place card or place detail page. Your saved place identifiers are kept in this browser, and the Saved area gathers them into a personal shortlist.'],
  ['Will my saved places follow me to another device?', 'Not in the current experience. Saved places are stored in browser local storage, so they remain specific to the browser where you saved them.'],
  ['Can I change the appearance?', 'Yes. Use the theme control in the navigation to cycle between light, dark, and system appearance. Your preference is saved in this browser.'],
  ['Are venue details always current?', 'Guide information can change. Check directly with a venue for time-sensitive details such as opening hours, reservations, and availability.'],
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <InfoPageShell eyebrow="Frequently Asked Questions" title="Useful things to know." intro="A short guide to the current Romely experience.">
      <div className="max-w-3xl divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/10 dark:border-white/10">
        {questions.map(([question, answer], index) => {
          const open = openIndex === index;
          return (
            <section key={question}>
              <h2>
                <button type="button" onClick={() => setOpenIndex(open ? null : index)} aria-expanded={open} className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-xl text-stone-900 transition-colors hover:text-[#9A743E] dark:text-white dark:hover:text-[#C5A880] sm:text-2xl">
                  {question}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#C5A880] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h2>
              {open && <p className="max-w-2xl pb-6 text-sm leading-7 text-stone-600 dark:text-stone-300">{answer}</p>}
            </section>
          );
        })}
      </div>
    </InfoPageShell>
  );
}
