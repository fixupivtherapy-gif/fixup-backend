import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontDisplay, fontSans, fontMono } from '@/lib/fonts';
import { NavShell } from '@/components/nav-shell';
import { cn } from '@/lib/utils';

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
  if (!routing.locales.includes(locale as 'es' | 'en')) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(
        fontDisplay.variable,
        fontSans.variable,
        fontMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="bg-bone text-ink font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NavShell>{children}</NavShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
