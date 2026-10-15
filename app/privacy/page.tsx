import { InfoPageShell } from '@/components/InfoPageShell';

const sections = [
  ['What Romely stores in your browser', 'Romely stores your selected theme preference and saved place identifiers in your browser’s local storage. These settings help the site remember your display preference and saved list on that browser.'],
  ['Catalogue content', 'Destination and place information is loaded from the application’s catalogue database to display guides and place details.'],
  ['What this site does not currently provide', 'The current site does not include a public contact form or a public account-registration flow. This policy does not make claims about analytics, advertising, cookies, or third-party services that are not confirmed by the application code.'],
  ['Your choices', 'You can clear browser local storage through your browser settings to remove locally stored theme and saved-place preferences.'],
];

export default function PrivacyPage() {
  return (
    <InfoPageShell eyebrow="Privacy" title="Privacy, in plain language." intro="This summary describes the data handling that is visible in the current Romely application.">
      <div className="max-w-3xl divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/10 dark:border-white/10">
        {sections.map(([title, text]) => (
          <section key={title} className="py-7">
            <h2 className="font-serif text-2xl text-stone-900 dark:text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{text}</p>
          </section>
        ))}
      </div>
    </InfoPageShell>
  );
}
