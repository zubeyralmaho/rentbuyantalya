'use client';

import React from 'react';
import ApartRentalServicePage from '@/components/services/ApartRentalServicePage';

export default function ApartRentalPage({ 
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

  return <ApartRentalServicePage locale={locale} />;
}