'use client';

import React from 'react';
import VipTransferServicePage from '@/components/services/VipTransferServicePage';

export default function VipTransferPage({ 
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

  return <VipTransferServicePage locale={locale} />;
}