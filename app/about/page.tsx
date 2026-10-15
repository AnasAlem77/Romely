import { Compass, Heart, Landmark } from 'lucide-react';
import { InfoPageShell } from '@/components/InfoPageShell';

const principles = [
  { icon: Landmark, title: 'A considered point of view', text: 'Romely collects places with a sense of architectural character, cultural presence, and a setting worth lingering in.' },
  { icon: Compass, title: 'Discovery with direction', text: 'Explore destinations, landmarks, sanctuaries, and editorial notes through a calm, focused guide.' },
  { icon: Heart, title: 'Save what stays with you', text: 'Keep a personal shortlist of places to return to as you plan your next walk, stay, or journey.' },
];

export default function AboutPage() {
  return (
    <InfoPageShell eyebrow="About Romely" title="Travel, observed with care." intro="Romely is a curated travel-discovery guide for finding places with lasting atmosphere: memorable architecture, quiet corners, and distinctive city rituals.">
      <section className="grid gap-4 sm:grid-cols-3">
        {principles.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#121215]">
            <Icon className="mb-5 h-5 w-5 text-[#C5A880]" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-stone-900 dark:text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{text}</p>
          </article>
        ))}
      </section>
      <section className="mt-12 max-w-3xl space-y-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
        <h2 className="font-serif text-3xl text-stone-900 dark:text-white">A quieter way to choose where to go.</h2>
        <p>Rather than trying to catalogue every possible stop, Romely brings a smaller selection into focus. Each guide is designed to make room for observation, not urgency.</p>
        <p>Use it to discover a destination, follow a thread through its places, and save the ones that belong in your own itinerary.</p>
      </section>
    </InfoPageShell>
  );
}
