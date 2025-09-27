"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface FAQItem {
  id: string;
  question_tr: string;
  answer_tr: string;
  question_en: string;
  answer_en: string;
  question_ru: string;
  answer_ru: string;
  question_ar: string;
  answer_ar: string;
  service_type: string;
  sort_order: number;
}

interface ServiceFAQProps {
  serviceType: string;
  className?: string;
}

export default function ServiceFAQ({ serviceType, className = "" }: ServiceFAQProps) {
  const t = useTranslations('faq');
  const locale = useLocale();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServiceFAQs();
  }, [serviceType]);

  const fetchServiceFAQs = async () => {
    try {
      const response = await fetch(`/api/faqs?service=${serviceType}`);
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data.faqs || []);
      } else {
        console.error('Error fetching service FAQs');
        setFaqItems([]);
      }
    } catch (error) {
      console.error('Error fetching service FAQs:', error);
      setFaqItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedQuestion = (item: FAQItem): string => {
    switch (locale) {
      case 'en': return item.question_en || item.question_tr;
      case 'ru': return item.question_ru || item.question_tr;
      case 'ar': return item.question_ar || item.question_tr;
      default: return item.question_tr;
    }
  };

  const getLocalizedAnswer = (item: FAQItem): string => {
    switch (locale) {
      case 'en': return item.answer_en || item.answer_tr;
      case 'ru': return item.answer_ru || item.answer_tr;
      case 'ar': return item.answer_ar || item.answer_tr;
      default: return item.answer_tr;
    }
  };

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Service ismine göre başlık çevirisi
  const getServiceTitle = () => {
    switch (serviceType) {
      case 'rent-a-car': return locale === 'en' ? 'Car Rental FAQs' : 'Araç Kiralama SSS';
      case 'vip-transfer': return locale === 'en' ? 'VIP Transfer FAQs' : 'VIP Transfer SSS';
      case 'tekne-kiralama': return locale === 'en' ? 'Boat Rental FAQs' : 'Tekne Kiralama SSS';
      case 'villa-kiralama': return locale === 'en' ? 'Villa Rental FAQs' : 'Villa Kiralama SSS';
      case 'apart-kiralama': return locale === 'en' ? 'Apartment Rental FAQs' : 'Apart Kiralama SSS';
      case 'properties-for-sale': return locale === 'en' ? 'Properties FAQs' : 'Satılık Konutlar SSS';
      default: return locale === 'en' ? 'Frequently Asked Questions' : 'Sık Sorulan Sorular';
    }
  };

  if (isLoading) {
    return (
      <section className={`py-12 ${className}`} style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom">
          <div className="text-center py-8">
            <div className="text-gray-500">FAQ'lar yükleniyor...</div>
          </div>
        </div>
      </section>
    );
  }

  if (faqItems.length === 0) {
    return null; // FAQ yoksa hiçbir şey gösterme
  }

  return (
    <section className={`py-12 lg:py-16 ${className}`} style={{background: 'var(--dark-bg)'}}>
      <div className="container-custom">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
            {getServiceTitle()}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
            {locale === 'en' 
              ? 'Find answers to frequently asked questions about our service' 
              : 'Bu hizmetimizle ilgili sık sorulan soruların cevaplarını bulun'
            }
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqItems
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {getLocalizedQuestion(item)}
                    </span>
                    <div className={`flex-shrink-0 transition-transform duration-200 ${openItems.has(index) ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-200 ease-in-out ${openItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-5">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed">
                          {getLocalizedAnswer(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {locale === 'en' ? 'Still have questions?' : 'Hala sorularınız var mı?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'en' 
                ? "Contact us directly and we'll be happy to help you."
                : 'Bizimle direkt iletişime geçin, size yardımcı olmaktan memnuniyet duyarız.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}?text=Merhaba, ${getServiceTitle()} hakkında soru sormak istiyorum.`}
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
                {locale === 'en' ? 'WhatsApp' : 'WhatsApp'}
              </a>
              <a
                href="tel:+905071564700"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {locale === 'en' ? 'Call Us' : 'Ara'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}