import type { Metadata } from 'next';
import './globals.css';
import { AppContextProvider } from '@/components/AppContext';
import { Navbar } from '@/components/Navbar';
import { SavedDrawer } from '@/components/SavedDrawer';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ROMELY — Minimalist Luxury Travel Guide',
  description: 'Curated luxury travel guides to the world’s most evocative cities. Discover insider tips, architectural landmarks, quiet cafes, and timeless hospitality.',
  openGraph: {
    title: 'ROMELY — Minimalist Luxury Travel Guide',
    description: 'Curated luxury travel guides to the world’s most evocative cities and architectural sanctuaries.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ROMELY — Minimalist Luxury Travel Guide',
    description: 'Curated luxury travel guides to the world’s most evocative cities and architectural sanctuaries.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('romely_theme') || localStorage.getItem('edition_voyage_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark) || (storedTheme === 'system' && prefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[#C5A880]/20 selection:text-[#B39266] min-h-screen flex flex-col justify-between" suppressHydrationWarning>
        <AppContextProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <SavedDrawer />
          <Footer />
        </AppContextProvider>
      </body>
    </html>
  );
}
