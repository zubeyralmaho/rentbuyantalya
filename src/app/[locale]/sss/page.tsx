'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { GeneralFaq, Locale } from '@/types/database';

export default function GeneralFAQPage() {
  const t = useTranslations('faq');
  const locale = useLocale() as Locale;
  const [faqs, setFaqs] = useState<GeneralFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch(`/api/general-faqs`);
        if (response.ok) {
          const data = await response.json();
          setFaqs(data.faqs || []);
        } else {
          console.error('Error fetching general FAQs');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getLocalizedContent = (faq: GeneralFaq, field: 'question' | 'answer') => {
    const localeField = `${field}_${locale}` as keyof GeneralFaq;
    const fallbackField = `${field}_tr` as keyof GeneralFaq;
    return (faq[localeField] as string) || (faq[fallbackField] as string) || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom pt-24 pb-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: 'var(--accent-500)'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--dark-bg)'}}>
      <div className="container-custom pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{color: 'var(--dark-text)'}}>
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
            Size en çok sorulan soruların yanıtlarını burada bulabilirsiniz. Aradığınız soruyu bulamıyor musunuz? Bizimle iletişime geçin.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
                Henüz SSS Eklenmemiş
              </h3>
              <p style={{color: 'var(--dark-text-muted)'}}>
                Yakında sık sorulan soruları burada bulabileceksiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="rounded-xl border transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: openIndex === index ? 'var(--accent-500)' : 'var(--neutral-700)'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold pr-4" style={{color: 'var(--dark-text)'}}>
                      {getLocalizedContent(faq, 'question')}
                    </h3>
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        openIndex === index ? 'rotate-45' : ''
                      }`}
                      style={{borderColor: 'var(--accent-500)'}}
                    >
                      <svg
                        className="w-4 h-4"
                        style={{color: 'var(--accent-500)'}}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="pt-2 border-t" style={{borderColor: 'var(--neutral-700)'}}>
                        <p className="text-base leading-relaxed" style={{color: 'var(--dark-text-muted)'}}>
                          {getLocalizedContent(faq, 'answer')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl border" style={{background: 'var(--dark-bg-secondary)', borderColor: 'var(--neutral-700)'}}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
              Başka Sorularınız Var mı?
            </h3>
            <p className="mb-6" style={{color: 'var(--dark-text-muted)'}}>
              Aradığınız soruyu bulamadınız mı? 7/24 müşteri hizmetlerimizle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: 'white'
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 border hover:bg-white/5"
                style={{
                  borderColor: 'var(--accent-500)',
                  color: 'var(--accent-500)'
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Telefon
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}