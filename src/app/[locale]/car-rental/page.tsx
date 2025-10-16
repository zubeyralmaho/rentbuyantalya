'use client';

import React from 'react';
import CarRentalServicePage from '@/components/services/CarRentalServicePage';

export default function CarRentalPage({ 
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

  return <CarRentalServicePage locale={locale} />;
}