'use client';

import React from 'react';
import PropertiesForSaleServicePage from '@/components/services/PropertiesForSaleServicePage';

export default function PropertiesForSalePage({ 
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

  return <PropertiesForSaleServicePage locale={locale} />;
}