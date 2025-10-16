'use client';

import React from 'react';
import VillaRentalServicePage from '@/components/services/VillaRentalServicePage';

export default function VillaRentalPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const [locale, setLocale] = React.useState('tr');
  
  React.useEffect(() => {
    params.then(resolvedParams => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);

  return <VillaRentalServicePage locale={locale} />;
}