import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface ListingDetailPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('listing');

  // TODO: Fetch listing data from API using slug
  // For now, show a placeholder page
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Listing Details
          </h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-lg mb-4">
              <strong>Slug:</strong> {slug}
            </p>
            <p className="text-lg mb-4">
              <strong>Locale:</strong> {locale}
            </p>
            <p className="text-gray-300">
              This is a placeholder page for listing details. The actual listing data will be fetched from the API based on the slug.
            </p>
          </div>

          <div className="text-center">
            <a 
              href={`/${locale}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  return {
    title: `Listing ${slug} | RentBuy Antalya`,
    description: `Details for listing ${slug}`,
  };
}