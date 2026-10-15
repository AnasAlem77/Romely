import type { ReactNode } from 'react';

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function InfoPageShell({ eyebrow, title, intro, children }: InfoPageShellProps) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 md:py-14">
      <main className="mx-auto max-w-4xl">
        <header className="max-w-3xl border-b border-stone-200 pb-8 dark:border-white/10 md:pb-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#9A743E] dark:text-[#C5A880]">
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900 dark:text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            {intro}
          </p>
        </header>
        <div className="py-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
