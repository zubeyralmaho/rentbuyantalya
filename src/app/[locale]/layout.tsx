import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const locales = ['tr', 'en', 'ru', 'ar'] as const;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Geçici olarak notFound atmayalım; 404 sebebini izole etmek istiyoruz
  const safeLocale = locales.includes(locale as any) ? locale : 'tr';

  const messages = await getMessages({locale: safeLocale});
  console.log('Layout Debug - URL Locale:', locale, '-> Safe Locale:', safeLocale, 'Messages Keys:', Object.keys(messages));
  console.log('Layout Debug - Sample message check:', messages.home?.hero?.title);

  // html/body üst root layout'ta; burada sadece provider sarmalayıcı kalsın
  const dir = safeLocale === 'ar' ? 'rtl' : 'ltr';
  return (
    <AuthProvider>
      <NextIntlClientProvider messages={messages} locale={safeLocale}>
        <div lang={safeLocale} dir={dir} className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </AuthProvider>
  );
}