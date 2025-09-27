import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  const actualLocale = locale || 'tr';
  console.log('[i18n] Loading locale:', locale, '-> actualLocale:', actualLocale);

  const messages = (await import(`../../messages/${actualLocale}.json`)).default;
  console.log('[i18n] Message keys loaded:', Object.keys(messages));
  
  return {
    locale: actualLocale,
    messages
  };
});