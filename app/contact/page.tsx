import { Github, Info } from 'lucide-react';
import { InfoPageShell } from '@/components/InfoPageShell';

export default function ContactPage() {
  return (
    <InfoPageShell eyebrow="Contact" title="Get in touch." intro="Romely does not currently publish a support email address, contact form, or message-submission service.">
      <section className="max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#121215] sm:p-8">
        <div className="flex gap-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#C5A880]" aria-hidden="true" />
          <div>
            <h2 className="font-serif text-2xl text-stone-900 dark:text-white">Published project contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">The project footer links to its developer’s public GitHub profile. That is the only contact destination currently available in the application.</p>
            <a href="https://github.com/AnasAlem77" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#9A743E] transition-colors hover:text-[#C5A880] dark:text-[#C5A880]">
              <Github className="h-4 w-4" aria-hidden="true" />
              Visit Anas Alem on GitHub
            </a>
          </div>
        </div>
      </section>
    </InfoPageShell>
  );
}
