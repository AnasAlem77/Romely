import { InfoPageShell } from '@/components/InfoPageShell';

const terms = [
  ['Use of Romely', 'Romely is provided as a travel-discovery guide. You may browse its guides and use its saved-place feature for personal planning.'],
  ['Travel decisions', 'Information on Romely is for general discovery and inspiration. Availability, opening hours, pricing, access, and other details may change. Confirm important details directly with the relevant venue before making plans.'],
  ['Your saved places', 'Saved places are stored locally in your browser. Clearing browser storage or switching browsers may remove that list.'],
  ['Content and availability', 'We may update, change, or remove guide content and features as the site evolves. The site may occasionally be unavailable while it is being maintained.'],
  ['These terms', 'These are general website terms for the current Romely experience and are not presented as legal advice or as a statement of legal review.'],
];

export default function TermsPage() {
  return (
    <InfoPageShell eyebrow="Terms of Use" title="A few simple terms." intro="These terms set expectations for using the current Romely website.">
      <div className="max-w-3xl space-y-6">
        {terms.map(([title, text], index) => (
          <section key={title} className="grid gap-3 border-b border-stone-200 pb-6 dark:border-white/10 sm:grid-cols-[3rem_1fr]">
            <span className="font-mono text-xs text-[#9A743E] dark:text-[#C5A880]">0{index + 1}</span>
            <div><h2 className="font-serif text-2xl text-stone-900 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{text}</p></div>
          </section>
        ))}
      </div>
    </InfoPageShell>
  );
}
