import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentBuy Antalya - Turizm Hizmetleri",
  description: "Antalya'da araç kiralama, VIP transfer, tekne ve villa kiralama hizmetleri",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/rentbuyfavicon.ico' },
    ],
    shortcut: '/rentbuyfavicon.ico',
    apple: '/rentbuyfavicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/rentbuyfavicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/rentbuyfavicon.ico" type="image/x-icon" />
        <script async defer
          src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap">
        </script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
