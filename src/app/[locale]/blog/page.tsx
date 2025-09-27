'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { BlogPost, Locale } from '@/types/database';
import Link from 'next/link';

export default function BlogPage() {
  const locale = useLocale() as Locale;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/blog${selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(
            (data.posts || []).map((post: BlogPost) => post.category).filter(Boolean)
          )) as string[];
          setCategories(uniqueCategories);
        } else {
          console.error('Error fetching blog posts');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  const getLocalizedContent = (post: BlogPost, field: 'title' | 'excerpt' | 'content') => {
    const localeField = `${field}_${locale}` as keyof BlogPost;
    const fallbackField = `${field}_tr` as keyof BlogPost;
    return (post[localeField] as string) || (post[fallbackField] as string) || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'var(--dark-bg)'}}>
        <div className="container-custom pt-24 pb-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: 'var(--accent-500)'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--dark-bg)'}}>
      <div className="container-custom pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{color: 'var(--dark-text)'}}>
            Blog & Rehber
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
            Antalya hakkında rehberler, ipuçları ve güncel bilgiler. Size faydalı olacak içeriklerimizi keşfedin.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === '' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Tümü
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
              {selectedCategory ? `${selectedCategory} kategorisinde blog yazısı yok` : 'Henüz Blog Yazısı Yok'}
            </h3>
            <p style={{color: 'var(--dark-text-muted)'}}>
              Yakında faydalı rehberler ve ipuçları burada yer alacak. Takipte kalın!
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tüm Yazıları Gör
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {posts.filter(post => post.featured).length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8" style={{color: 'var(--dark-text)'}}>
                  Öne Çıkan Yazılar
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {posts.filter(post => post.featured).slice(0, 2).map((post) => (
                    <Link
                      key={post.id}
                      href={`/${locale}/blog/${post.slug}`}
                      className="group block rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--dark-bg-secondary)',
                        borderColor: 'var(--accent-500)'
                      }}
                    >
                      {/* Featured Image */}
                      {post.featured_image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={getLocalizedContent(post, 'title')}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          
                          {/* Featured Badge */}
                          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                            ⭐ Öne Çıkan
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category & Date */}
                        <div className="flex items-center text-sm mb-3" style={{color: 'var(--dark-text-muted)'}}>
                          {post.category && (
                            <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs mr-3">
                              {post.category}
                            </span>
                          )}
                          <span>{formatDate(post.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span>{calculateReadTime(getLocalizedContent(post, 'content'))} dk okuma</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors" style={{color: 'var(--dark-text)'}}>
                          {getLocalizedContent(post, 'title')}
                        </h3>

                        {/* Excerpt */}
                        {getLocalizedContent(post, 'excerpt') && (
                          <p className="text-sm line-clamp-3" style={{color: 'var(--dark-text-muted)'}}>
                            {getLocalizedContent(post, 'excerpt')}
                          </p>
                        )}

                        {/* Read More */}
                        <div className="mt-4 flex items-center text-sm font-medium" style={{color: 'var(--accent-500)'}}>
                          Devamını Oku
                          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.filter(post => !post.featured).map((post) => (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block rounded-xl border overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)'
                  }}
                >
                  {/* Featured Image */}
                  {post.featured_image && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={getLocalizedContent(post, 'title')}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Category & Date */}
                    <div className="flex items-center text-xs mb-3" style={{color: 'var(--dark-text-muted)'}}>
                      {post.category && (
                        <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs mr-2">
                          {post.category}
                        </span>
                      )}
                      <span>{formatDate(post.created_at)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2" style={{color: 'var(--dark-text)'}}>
                      {getLocalizedContent(post, 'title')}
                    </h3>

                    {/* Excerpt */}
                    {getLocalizedContent(post, 'excerpt') && (
                      <p className="text-sm line-clamp-2 mb-3" style={{color: 'var(--dark-text-muted)'}}>
                        {getLocalizedContent(post, 'excerpt')}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'var(--accent-500)'}}>
                        Devamını Oku
                      </span>
                      <span className="text-xs" style={{color: 'var(--dark-text-muted)'}}>
                        {calculateReadTime(getLocalizedContent(post, 'content'))} dk
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl border" style={{background: 'var(--dark-bg-secondary)', borderColor: 'var(--neutral-700)'}}>
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
              Konu Önerisi Var mı?
            </h3>
            <p className="mb-6" style={{color: 'var(--dark-text-muted)'}}>
              Hangi konular hakkında yazı okumak istiyorsanız, önerilerinizi bize iletin!
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '905071564700'}?text=Merhaba, blog için konu önerim var.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white'
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Öneri Gönder
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}