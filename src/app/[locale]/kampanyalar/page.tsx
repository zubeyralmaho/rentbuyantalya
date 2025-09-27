'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Campaign, Locale } from '@/types/database';

export default function CampaignsPage() {
  const locale = useLocale() as Locale;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`/api/campaigns`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        } else {
          console.error('Error fetching campaigns');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getLocalizedContent = (campaign: Campaign, field: 'title' | 'description' | 'content') => {
    const localeField = `${field}_${locale}` as keyof Campaign;
    const fallbackField = `${field}_tr` as keyof Campaign;
    return (campaign[localeField] as string) || (campaign[fallbackField] as string) || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isValidCampaign = (campaign: Campaign) => {
    const now = new Date();
    const validUntil = campaign.valid_until ? new Date(campaign.valid_until) : null;
    return !validUntil || validUntil > now;
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
            Kampanyalar & Fırsatlar
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
            Özel indirimli fiyatlarla Antalya'nın en iyi hizmetlerinden yararlanın. Sınırlı süreli tekliflerimizi kaçırmayın!
          </p>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
              Henüz Kampanya Yok
            </h3>
            <p style={{color: 'var(--dark-text-muted)'}}>
              Yakında harika kampanyalar ve fırsatlar burada yer alacak. Takipte kalın!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105 ${
                  campaign.featured ? 'ring-2 ring-blue-500' : ''
                } ${!isValidCampaign(campaign) ? 'opacity-60' : ''}`}
                style={{
                  background: 'var(--dark-bg-secondary)',
                  borderColor: campaign.featured ? 'var(--accent-500)' : 'var(--neutral-700)'
                }}
              >
                {/* Campaign Image */}
                {campaign.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={campaign.image_url}
                      alt={getLocalizedContent(campaign, 'title')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Discount Badge */}
                    {campaign.discount_percentage && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        %{campaign.discount_percentage} İndirim
                      </div>
                    )}

                    {/* Featured Badge */}
                    {campaign.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ Öne Çıkan
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Campaign Title */}
                  <h3 className="text-xl font-bold mb-3" style={{color: 'var(--dark-text)'}}>
                    {getLocalizedContent(campaign, 'title')}
                  </h3>

                  {/* Campaign Description */}
                  <p className="text-sm mb-4" style={{color: 'var(--dark-text-muted)'}}>
                    {getLocalizedContent(campaign, 'description')}
                  </p>

                  {/* Campaign Details */}
                  <div className="space-y-2 mb-4">
                    {campaign.discount_percentage && (
                      <div className="flex items-center text-sm">
                        <span style={{color: 'var(--accent-500)'}} className="font-semibold">
                          💰 %{campaign.discount_percentage} indirim
                        </span>
                      </div>
                    )}
                    
                    {campaign.discount_amount && (
                      <div className="flex items-center text-sm">
                        <span style={{color: 'var(--accent-500)'}} className="font-semibold">
                          💰 {campaign.discount_amount} TL indirim
                        </span>
                      </div>
                    )}

                    {campaign.campaign_code && (
                      <div className="flex items-center text-sm">
                        <span style={{color: 'var(--dark-text-muted)'}}>
                          Kod: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{campaign.campaign_code}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Campaign Validity */}
                  {campaign.valid_until && (
                    <div className="mb-4 p-3 rounded-lg" style={{background: 'var(--dark-bg)'}}>
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" style={{color: 'var(--accent-500)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span style={{color: 'var(--dark-text-muted)'}}>
                          {isValidCampaign(campaign) 
                            ? `${formatDate(campaign.valid_until)} tarihine kadar geçerli`
                            : 'Kampanya süresi dolmuş'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex gap-3">
                    {isValidCampaign(campaign) ? (
                      <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}?text=Merhaba, ${getLocalizedContent(campaign, 'title')} kampanyası hakkında bilgi almak istiyorum.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                          color: 'white'
                        }}
                      >
                        Kampanyayı Kullan
                      </a>
                    ) : (
                      <div
                        className="flex-1 text-center px-4 py-2 rounded-lg font-medium"
                        style={{
                          background: 'var(--neutral-600)',
                          color: 'white',
                          cursor: 'not-allowed'
                        }}
                      >
                        Süre Dolmuş
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl border" style={{background: 'var(--dark-bg-secondary)', borderColor: 'var(--neutral-700)'}}>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
              Özel Teklifler için İletişime Geçin
            </h3>
            <p className="mb-6" style={{color: 'var(--dark-text-muted)'}}>
              Daha fazla kampanya ve özel indirimler için WhatsApp'tan bizimle iletişime geçin!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}?text=Merhaba, kampanyalar hakkında bilgi almak istiyorum.`}
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
                WhatsApp'tan İletişim
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}