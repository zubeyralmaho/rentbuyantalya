'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AntalyaRentBuyLogo from './AntalyaRentBuyLogo';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  title: string;
}

export default function Header() {
  const locale = useLocale();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/services?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Header services fetched:', data.services);
          setServices(data.services || []);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [locale]);

  const navigation = [
    { name: tNav('home'), href: `/${locale}` },
    { name: tNav('faq'), href: `/${locale}/sss` },
    { name: tNav('about'), href: `/${locale}/hakkimizda` },
    { name: tNav('campaigns'), href: `/${locale}/kampanyalar` },
    { name: tNav('blog'), href: `/${locale}/blog` }
  ];

  // Service to image mapping
  const getServiceImage = (slug: string) => {
    const imageMap: { [key: string]: string } = {
      'rent-a-car': '/services/carrentalservice.jpg',
      'arac-kiralama': '/services/carrentalservice.jpg',
      'villa-rental': '/services/villarentalservice.jpg',
      'villa-kiralama': '/services/villarentalservice.jpg',
      'boat-rental': '/services/yachtservice.jpg',
      'tekne-kiralama': '/services/yachtservice.jpg',
      'vip-transfer': '/services/viptransferservice.jpg',
      'apart-rental': '/services/apartrentalservice.jpg',
      'apart-kiralama': '/services/apartrentalservice.jpg',
      'apartment-rental': '/services/apartrentalservice.jpg',
      'arenda-kvartir': '/services/apartrentalservice.jpg',
      'taajir-alshiqaq': '/services/apartrentalservice.jpg',
      'properties-for-sale': '/services/propertiesforsaleservice.jpg',
      'satilik-konutlar': '/services/propertiesforsaleservice.jpg'
    };
    return imageMap[slug] || '/services/carrentalservice.jpg';
  };

  const languages = [
    { code: 'tr', name: 'TR', flag: '🇹🇷' },
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' },
    { code: 'ar', name: 'AR', flag: '🇸🇦' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm border-b" style={{background: 'var(--dark-bg)', borderColor: 'var(--neutral-800)'}}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <AntalyaRentBuyLogo 
              width={160}
              accent="var(--accent-500)"
              textColor="var(--dark-text)"
              background="transparent"
              showCity={false}
              className="h-12 w-auto"
            />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Home Link */}
            <Link
              href={`/${locale}`}
              className="nav-link relative group font-medium transition-colors duration-200"
            >
              {tNav('home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="nav-link relative font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>{tNav('services')}</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
              </button>
              
              {/* Services Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-80 rounded-xl shadow-2xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0" 
                   style={{background: 'var(--dark-bg-secondary)', borderColor: 'var(--neutral-700)'}}>
                <div className="p-2">
                  {services.map((service, index) => (
                    <Link
                      key={service.id}
                      href={`/${locale}/${service.slug}`}
                      className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5 group/item"
                    >
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={getServiceImage(service.slug)} 
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm nav-link group-hover/item:text-white transition-colors duration-200">
                          {service.title}
                        </h4>
                      </div>
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Pages Links */}
            <Link
              href={`/${locale}/sss`}
              className="nav-link relative group font-medium transition-colors duration-200"
            >
              {tNav('faq')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <Link
              href={`/${locale}/hakkimizda`}
              className="nav-link relative group font-medium transition-colors duration-200"
            >
              {tNav('about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <Link
              href={`/${locale}/kampanyalar`}
              className="nav-link relative group font-medium transition-colors duration-200"
            >
              {tNav('campaigns')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <Link
              href={`/${locale}/blog`}
              className="nav-link relative group font-medium transition-colors duration-200"
            >
              {tNav('blog')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Language Switcher & Contact */}
          <div className="flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 nav-link font-medium">
                <span>{languages.find(l => l.code === locale)?.flag}</span>
                <span className="hidden sm:block">{languages.find(l => l.code === locale)?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-32 rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style={{background: 'var(--dark-bg-secondary)', borderColor: 'var(--neutral-700)'}}>
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm nav-link hover:brightness-125 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth Button */}
            {user ? (
              <Link
                href={`/${locale}/profile`}
                className="btn-primary hidden sm:inline-flex text-sm px-4 py-2"
              >
                👤 {tNav('profile')}
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth`}
                className="btn-primary hidden sm:inline-flex text-sm px-4 py-2"
              >
                 {tNav('members')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg nav-link transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t" style={{borderColor: 'var(--neutral-700)'}}>
            <div className="container mx-auto px-6 py-4">
              <div className="space-y-4">
                {/* Home Link */}
                <Link
                  href={`/${locale}`}
                  className="block nav-link font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {tNav('home')}
                </Link>

                {/* Services */}
                <div className="space-y-2">
                  <h3 className="font-medium text-white text-sm uppercase tracking-wider">
                    {tNav('services')}
                  </h3>
                  <div className="space-y-1 pl-4">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/${locale}/${service.slug}`}
                        className="flex items-center space-x-3 py-2 nav-link transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={getServiceImage(service.slug)} 
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm">{service.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Additional Pages */}
                <div className="space-y-1">
                  {navigation.slice(1).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block nav-link font-medium py-2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <h3 className="font-medium text-white text-sm uppercase tracking-wider">
                    {tCommon('language')}
                  </h3>
                  <div className="flex space-x-2 pl-4">
                    {languages.map((lang) => (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}`}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                          locale === lang.code ? 'bg-white/10' : 'nav-link hover:bg-white/5'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth Button */}
                {user ? (
                  <Link
                    href={`/${locale}/profile`}
                    className="btn-primary block text-center text-sm px-4 py-2 mt-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👤 {tNav('profile')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/auth`}
                    className="btn-primary block text-center text-sm px-4 py-2 mt-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🏆 {tNav('members')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}