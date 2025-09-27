import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['tr', 'en', 'ru', 'ar'],
 
  // Used when no locale matches
  defaultLocale: 'tr'
});
 
export const config = {
  // Match only internationalized pathnames, exclude admin panel and static assets
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|logo.png|herovideo.mp4|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.pdf|.*\\.zip).*)']
};