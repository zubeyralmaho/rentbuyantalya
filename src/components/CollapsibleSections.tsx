'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  featured_image?: string;
}

interface CollapsibleSectionsProps {
  locale: string;
}

export default function CollapsibleSections({ locale }: CollapsibleSectionsProps) {
  const t = useTranslations("home");
  const tNav = useTranslations("navigation");
  const tFaq = useTranslations("faq");
  const tBlog = useTranslations("blog");
  
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  
  // Data states
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);

  // Fetch FAQ data when FAQ section is opened
  useEffect(() => {
    if (isFaqOpen && faqItems.length === 0) {
      fetchFaqData();
    }
  }, [isFaqOpen]);

  // Fetch Blog data when Blog section is opened
  useEffect(() => {
    if (isBlogOpen && blogPosts.length === 0) {
      fetchBlogData();
    }
  }, [isBlogOpen]);

  const fetchFaqData = async () => {
    setLoadingFaq(true);
    try {
      const response = await fetch(`/api/faqs?locale=${locale}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data.faqs || []);
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
    } finally {
      setLoadingFaq(false);
    }
  };

  const fetchBlogData = async () => {
    setLoadingBlog(true);
    try {
      const response = await fetch(`/api/blog?locale=${locale}&featured=true&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoadingBlog(false);
    }
  };

  const getLocalizedContent = (item: any, field: string) => {
    const localeField = `${field}_${locale}`;
    const fallbackField = `${field}_tr`;
    return item[localeField] || item[fallbackField] || item[field] || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 
                                 locale === 'en' ? 'en-US' : 
                                 locale === 'ru' ? 'ru-RU' : 'ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* About Section */}
      <section className="py-8 sm:py-10 lg:py-14" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom">
          <div className="fade-in">
            {/* About Header - Clickable */}
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-white/5 group"
              style={{background: 'var(--dark-bg-secondary)'}}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{color: 'var(--dark-text)'}}>
                {t("about.title")}
              </h2>
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{color: 'var(--accent-500)'}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* About Content - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ${isAboutOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg p-4" style={{color: 'var(--dark-text-muted)'}}>
                <p>{t("about.description1")}</p>
                <p>{t("about.description2")}</p>
                <p>{t("about.description3")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-10 lg:py-14" style={{background: 'var(--dark-bg-secondary)'}}>
        <div className="container-custom">
          <div className="fade-in">
            {/* FAQ Header - Clickable */}
            <button
              onClick={() => setIsFaqOpen(!isFaqOpen)}
              className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-white/5 group"
              style={{background: 'var(--dark-bg)'}}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{color: 'var(--dark-text)'}}>
                {tFaq("title")}
              </h2>
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${isFaqOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{color: 'var(--accent-500)'}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* FAQ Content - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ${isFaqOpen ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 p-4">
                {loadingFaq ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{borderColor: 'var(--accent-500)'}}></div>
                  </div>
                ) : faqItems.length > 0 ? (
                  <>
                    {faqItems.map((faq, index) => (
                      <div key={faq.id} className="space-y-3">
                        <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>
                          {getLocalizedContent(faq, 'question')}
                        </h3>
                        <p style={{color: 'var(--dark-text-muted)'}}>
                          {getLocalizedContent(faq, 'answer')}
                        </p>
                      </div>
                    ))}
                    <Link 
                      href={`/${locale}/sss`}
                      className="inline-flex items-center space-x-2 text-accent-500 hover:text-accent-400 transition-colors"
                    >
                      <span>{tFaq("viewAll")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Fallback to static content from translations */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>{t("faq.items.0.question")}</h3>
                      <p style={{color: 'var(--dark-text-muted)'}}>{t("faq.items.0.answer")}</p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>{t("faq.items.1.question")}</h3>
                      <p style={{color: 'var(--dark-text-muted)'}}>{t("faq.items.1.answer")}</p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>{t("faq.items.2.question")}</h3>
                      <p style={{color: 'var(--dark-text-muted)'}}>{t("faq.items.2.answer")}</p>
                    </div>
                    <Link 
                      href={`/${locale}/sss`}
                      className="inline-flex items-center space-x-2 text-accent-500 hover:text-accent-400 transition-colors"
                    >
                      <span>{t("faq.viewAll")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-8 sm:py-10 lg:py-14" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom">
          <div className="fade-in">
            {/* Blog Header - Clickable */}
            <button
              onClick={() => setIsBlogOpen(!isBlogOpen)}
              className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-white/5 group"
              style={{background: 'var(--dark-bg-secondary)'}}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{color: 'var(--dark-text)'}}>
                {tBlog("title")}
              </h2>
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${isBlogOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{color: 'var(--accent-500)'}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Blog Content - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ${isBlogOpen ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              {loadingBlog ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{borderColor: 'var(--accent-500)'}}></div>
                </div>
              ) : blogPosts.length > 0 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
                    {blogPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/${locale}/blog/${post.slug}`}
                        className="block rounded-lg p-4 transition-all duration-200 hover:bg-white/5"
                        style={{background: 'var(--dark-bg)'}}
                      >
                        {post.featured_image && (
                          <div className="relative h-24 mb-3 rounded overflow-hidden">
                            <img 
                              src={post.featured_image}
                              alt={getLocalizedContent(post, 'title')}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{color: 'var(--dark-text)'}}>
                          {getLocalizedContent(post, 'title')}
                        </h3>
                        <p className="text-sm mb-3 line-clamp-2" style={{color: 'var(--dark-text-muted)'}}>
                          {getLocalizedContent(post, 'excerpt')}
                        </p>
                        <span className="text-xs" style={{color: 'var(--accent-500)'}}>
                          {formatDate(post.created_at)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-4">
                    <Link 
                      href={`/${locale}/blog`}
                      className="inline-flex items-center space-x-2 text-accent-500 hover:text-accent-400 transition-colors"
                    >
                      <span>{tBlog("viewAll")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">{tBlog("noPostsAvailable")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}