import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getServicesByLocale, type ServiceListItem } from "@/lib/queries/services";
import AntalyaRentBuyLogo from "@/components/AntalyaRentBuyLogo";
import HeroSection from "@/components/HeroSection";

type Params = Promise<{ locale: string }>;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;

  const t = await getTranslations({locale, namespace: "home"});
  const tCommon = await getTranslations({locale, namespace: "common"});
  const tServices = await getTranslations({locale, namespace: "services"});

  // Fetch services from Supabase; gracefully fallback to static list if empty
  let services: ServiceListItem[] = [];
  try {
    services = await getServicesByLocale(locale);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("services fetch failed", e);
  }

  if (!services || services.length === 0) {
    services = [
      { id: "rent-a-car", slug: "rent-a-car", icon: null, sort_order: 1, title: tServices("rentACar.title"), summary: tServices("rentACar.description") },
      { id: "vip-transfer", slug: "vip-transfer", icon: null, sort_order: 2, title: tServices("vipTransfer.title"), summary: tServices("vipTransfer.description") },
      { id: "tekne-kiralama", slug: "tekne-kiralama", icon: null, sort_order: 3, title: tServices("boatRental.title"), summary: tServices("boatRental.description") },
      { id: "villa-kiralama", slug: "villa-kiralama", icon: null, sort_order: 4, title: tServices("villaRental.title"), summary: tServices("villaRental.description") },
      { id: "apart-rental", slug: "apart-rental", icon: null, sort_order: 5, title: tServices("apartRental.title"), summary: tServices("apartRental.description") },
      { id: "properties-for-sale", slug: "properties-for-sale", icon: null, sort_order: 6, title: tServices("propertiesForSale.title"), summary: tServices("propertiesForSale.description") },
    ];
  }

  // Helper function to get service image
  const getServiceImage = (slug: string, index: number) => {
    switch(slug) {
      case "rent-a-car":
      case "arac-kiralama": return "carrentalservice.jpg";
      case "vip-transfer": return "viptransferservice.jpg";
      case "tekne-kiralama":
      case "boat-rental": return "yachtservice.jpg";
      case "villa-kiralama":
      case "villa-rental": return "villarentalservice.jpg";
      case "apart-kiralama":
      case "apart-rental":
      case "apartment-rental": 
      case "arenda-kvartir": 
      case "taajir-alshiqaq": return "apartrentalservice.jpg";
      case "satilik-konutlar":
      case "properties-for-sale":
      case "nedvizhimost-na-prodazhu":
      case "aqarat-lilbay": return "propertiesforsaleservice.jpg";
      default: 
        // Fallback based on index for static services
        const imageMap = [
          "carrentalservice.jpg",
          "viptransferservice.jpg", 
          "yachtservice.jpg",
          "villarentalservice.jpg",
          "apartrentalservice.jpg",
          "propertiesforsaleservice.jpg"
        ];
        return imageMap[index] || "carrentalservice.jpg";
    }
  };

  return (
    <>
      

      {/* Services Section - Compact for mobile, moves up close to hero */}
      <section className="py-4 sm:py-8 lg:py-12" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom">
          {/* Social Action Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
            {process.env.NEXT_PUBLIC_WHATSAPP && (
              <a 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
                className="btn-social btn-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp İletişim"
              >
                <span className="social-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                </span>
                <span className="social-text">WhatsApp</span>
              </a>
            )}
            
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <a 
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                className="btn-social btn-instagram"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram'da Takip Et"
              >
                <span className="social-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
                <span className="social-text">rentbuy</span>
              </a>
            )}
            
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL_2 && (
              <a 
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL_2}
                className="btn-social btn-instagram-2"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram'da Takip Et"
              >
                <span className="social-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
                <span className="social-text">artirentacar</span>
              </a>
            )}
            
            {/* Location Button */}
            {process.env.NEXT_PUBLIC_MAPS_URL && (
              <a 
                href={process.env.NEXT_PUBLIC_MAPS_URL}
                className="btn-social btn-location"
                target="_blank"
                rel="noopener noreferrer"
                title="Konumu Görüntüle"
              >
              <span className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </span>
              <span className="social-text">Konum</span>
            </a>
            )}
          </div>

          <div className="text-center mb-4 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{color: 'var(--dark-text)'}}>
              {t("services.title")}
            </h2>
            <p className="hidden sm:block text-lg max-w-2xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
              {t("services.subtitle")}
            </p>
          </div>

          {/* Mobile: 2x3 Grid (2 columns, 3 rows) - Desktop: Same as before */}
          <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link 
                key={service.id}
                href={`/${locale}/${service.slug}`}
                className="group transition-all duration-300 hover:-translate-y-1 sm:service-card sm:hover:shadow-xl"
              >
                {/* Mobile: Large image only with text overlay */}
                <div className="sm:hidden relative h-32 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={`/services/${getServiceImage(service.slug, index)}`}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {service.title}
                    </h3>
                  </div>
                </div>
                
                {/* Desktop: Original layout */}
                <div className="hidden sm:block">
                  <div className="relative h-64 sm:h-72 lg:h-80 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={`/services/${getServiceImage(service.slug, index)}`}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--dark-text)'}}>
                      {service.title}
                    </h3>
                    <p className="text-base line-clamp-2" style={{color: 'var(--dark-text-muted)'}}>
                      {service.summary}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 sm:py-10 lg:py-14" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
            <div className="fade-in">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6" style={{color: 'var(--dark-text)'}}>
                {t("about.title")}
              </h2>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg" style={{color: 'var(--dark-text-muted)'}}>
                <p>{t("about.description1")}</p>
                <p>{t("about.description2")}</p>
                <p>{t("about.description3")}</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </section>
    </>
  );
}