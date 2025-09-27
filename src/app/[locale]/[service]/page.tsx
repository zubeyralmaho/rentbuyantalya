import { getTranslations } from "next-intl/server";
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Car, Plane, Anchor, Home, Building2 } from 'lucide-react';

// Import service-specific components
import CarRentalServicePage from '@/components/services/CarRentalServicePage';
import VipTransferServicePage from '@/components/services/VipTransferServicePage';
import BoatRentalServicePage from '@/components/services/BoatRentalServicePage';
import VillaRentalServicePage from '@/components/services/VillaRentalServicePage';
import ApartRentalServicePage from '@/components/services/ApartRentalServicePage';
import PropertiesForSaleServicePage from '@/components/services/PropertiesForSaleServicePage';

type Params = Promise<{ locale: string; service: string }>;

const iconMap = {
  car: Car,
  plane: Plane,
  anchor: Anchor,
  home: Home,
  building: Building2,
};

interface Listing {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  location: string;
  price_per_day: number;
  price_per_week?: number;
  max_guests?: number;
  listings_i18n: {
    title: string;
    description: string;
    location_details: string;
  }[];
}

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  services_i18n: {
    title: string;
    summary: string;
  }[];
}

export default async function ServicePage({ params }: { params: Params }) {
  const { locale, service } = await params;
  // Normalize known aliases to canonical slugs used in the services table
  const canonicalService = (() => {
    switch (service) {
      case 'car-rental':
      case 'arenda-avtomobiley':
      case 'arenda-avtomobilej':
        return 'rent-a-car';
      default:
        return service;
    }
  })();
  const tServices = await getTranslations("services");
  const tCommon = await getTranslations("common");

  // If we have a dedicated component for this service, render it directly
  // This bypasses the DB check, ensuring alias routes like "/tr/car-rental" still work.
  const directComponent = (() => {
    switch (canonicalService) {
      case 'rent-a-car':
      case 'arac-kiralama':
        return <CarRentalServicePage locale={locale} />;
      case 'vip-transfer':
        return <VipTransferServicePage locale={locale} />;
      case 'tekne-kiralama':
      case 'boat-rental':
        return <BoatRentalServicePage locale={locale} />;
      case 'villa-kiralama':
      case 'villa-rental':
        return <VillaRentalServicePage locale={locale} />;
      case 'apart-kiralama':
      case 'apart-rental':
      case 'apartment-rental':
        return <ApartRentalServicePage locale={locale} />;
      case 'satilik-konutlar':
      case 'properties-for-sale':
      case 'nedvizhimost-na-prodazhu':
      case 'aqarat-lilbay':
        return <PropertiesForSaleServicePage locale={locale} />;
      default:
        return null;
    }
  })();

  if (directComponent) {
    return directComponent;
  }

  const supabase = await createClient();
  
  // Get service data with i18n
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select(`
      *,
      services_i18n!inner (
        title,
        summary,
        body
      )
    `)
  .in('slug', [canonicalService, service])
    .eq('services_i18n.locale', locale)
    .eq('active', true)
    .single();

  // Get listings for this service
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      listings_i18n!left (
        title,
        description,
        location_details
      )
    `)
    .eq('service_id', serviceData?.id)
    .eq('listings_i18n.locale', locale)
    .eq('active', true)
    .order('sort_order');

  if (serviceError || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-800">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const ServiceIcon = iconMap[serviceData.icon as keyof typeof iconMap] || Home;
  const serviceTitle = serviceData.services_i18n[0]?.title || serviceData.name;
  const serviceSummary = serviceData.services_i18n[0]?.summary || '';

  // Route to specific service components based on service slug
  const renderServiceComponent = () => {
    switch (canonicalService) {
      case 'rent-a-car':
      case 'arac-kiralama':
        return <CarRentalServicePage locale={locale} />;
      
      case 'vip-transfer':
        return <VipTransferServicePage locale={locale} />;
      
      case 'tekne-kiralama':
      case 'boat-rental':
        return <BoatRentalServicePage locale={locale} />;
      
      case 'villa-kiralama':
      case 'villa-rental':
        return <VillaRentalServicePage locale={locale} />;
      
      case 'apart-kiralama':
      case 'apart-rental':
      case 'apartment-rental':
        return <ApartRentalServicePage locale={locale} />;
      
      case 'satilik-konutlar':
      case 'properties-for-sale':
      case 'nedvizhimost-na-prodazhu':
      case 'aqarat-lilbay':
        return <PropertiesForSaleServicePage locale={locale} />;
      
      default:
        // Fallback to generic template
        return null;
    }
  };

  const serviceComponent = renderServiceComponent();
  
  // If we have a specific service component, render it
  if (serviceComponent) {
    return serviceComponent;
  }

  // Otherwise, render the generic template
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="container-custom text-center text-white">
          <div className="text-6xl mb-6">
            <ServiceIcon />
          </div>
          <h1 className="heading-xl mb-4 text-white">{serviceTitle}</h1>
          {serviceSummary && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {serviceSummary}
            </p>
          )}
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Available {serviceTitle}</h2>
            
            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const listingTitle = listing.listings_i18n[0]?.title || listing.name;
                  const listingDescription = listing.listings_i18n[0]?.description || listing.description;
                  const locationDetails = listing.listings_i18n[0]?.location_details || listing.location;
                  
                  return (
                    <Link key={listing.id} href={`/${locale}/${service}/${listing.slug}`}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listingTitle}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ServiceIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {listing.price_per_day} TRY/gün
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-gray-900">
                            {listingTitle}
                          </h3>
                          
                          {locationDetails && (
                            <p className="text-gray-500 text-sm mb-2 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {locationDetails}
                            </p>
                          )}
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {listingDescription}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              {listing.price_per_week && (
                                <div className="text-sm text-gray-500">
                                  Haftalık: {listing.price_per_week} TRY
                                </div>
                              )}
                            </div>
                            
                            {listing.max_guests && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {listing.max_guests} kişi
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No listings available for this service.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}