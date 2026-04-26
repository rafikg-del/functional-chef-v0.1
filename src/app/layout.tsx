import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Functional Chef — IA cuisinière EBM-driven',
  description:
    'Moteur de prescription nutritionnelle ciblée par bottleneck physiopathologique. EBM tiering explicite (T1/T2/T3) sur chaque levier mobilisé.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable} ${mono.variable}`}>
      <body className="bg-ink-50 text-ink-900 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
