import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Panel - RentBuy Antalya',
  description: 'RentBuy Antalya Admin Panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
