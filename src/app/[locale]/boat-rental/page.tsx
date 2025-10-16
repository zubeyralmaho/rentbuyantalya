'use client';

import React from 'react';
import BoatRentalServicePage from '@/components/services/BoatRentalServicePage';

export default function BoatRentalPage({ 
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

  return <BoatRentalServicePage locale={locale} />;
}