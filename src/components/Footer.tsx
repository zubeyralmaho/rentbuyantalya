'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const locale = useLocale();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');

  const currentYear = new Date().getFullYear();

  const navigation = [
    { name: tNav('home'), href: `/${locale}` },
    { name: tNav('rentACar'), href: `/${locale}/rent-a-car` },
    { name: tNav('vipTransfer'), href: `/${locale}/vip-transfer` },
    { name: tNav('boatRental'), href: `/${locale}/tekne-kiralama` },
    { name: tNav('villaRental'), href: `/${locale}/villa-kiralama` },
    { name: tNav('about'), href: `/${locale}/about` },
    { name: tNav('contact'), href: `/${locale}/contact` },
  ];

  return (
    <footer style={{background: 'var(--neutral-900)'}} className="text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <img 
                  src="/Rent.png"
                  alt="Rent & Buy Logo"
                  className="h-16 w-auto"
                />
              </div>
              
              <p className="max-w-md mb-6 leading-relaxed" style={{color: 'var(--dark-text-muted)'}}>
                {tFooter('description')}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a 
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
                  className="flex items-center space-x-3 transition-colors"
                  style={{color: '#25D366'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                  <span>+90 507 156 47 00</span>
                </a>
                
                <a 
                  href={process.env.NEXT_PUBLIC_MAPS_URL}
                  className="flex items-center space-x-3 transition-colors hover:text-white"
                  style={{color: 'var(--dark-text-muted)'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>{tFooter('location')}</span>
                </a>
                
                <a 
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                  className="flex items-center space-x-3 transition-colors"
                  style={{color: '#E4405F'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>{tFooter('instagramHandle')}</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="heading-sm text-white mb-6">{tFooter('quickLinks')}</h3>
              <ul className="space-y-3">
                {navigation.slice(0, 4).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="heading-sm text-white mb-6">{tFooter('ourServices')}</h3>
              <ul className="space-y-3">
                {navigation.slice(1, 5).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t py-6" style={{borderColor: 'var(--neutral-700)'}}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm" style={{color: 'var(--neutral-400)'}}>
              © {currentYear} {tCommon('rentBuyAntalya')}. {tFooter('copyright')}
            </p>
            
            <div className="flex space-x-6">
              <Link href={`/${locale}/privacy`} className="text-sm transition-colors hover:text-white" style={{color: 'var(--neutral-400)'}}>
                {tFooter('privacyPolicy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-sm transition-colors hover:text-white" style={{color: 'var(--neutral-400)'}}>
                {tFooter('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}