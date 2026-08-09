import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';

// Covers Thai and Latin glyphs in one family, so the UI never falls back
// mid-sentence on a mixed Thai/English label.
const appFont = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-app',
});

export const metadata: Metadata = {
  title: 'Harnpa',
  description: 'Split bills, settle debts. Track shared expenses and settle up with friends.',
  openGraph: {
    title: 'Harnpa - Bill Splitting Made Easy',
    description: 'Split bills, settle debts. Track shared expenses and settle up with friends.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Harnpa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harnpa - Bill Splitting Made Easy',
    description: 'Split bills, settle debts. Track shared expenses and settle up with friends.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#faf7f2',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={appFont.variable} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
