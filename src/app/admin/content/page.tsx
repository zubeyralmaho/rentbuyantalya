'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page, GeneralFaq, Campaign, BlogPost } from '@/types/database';
import ContentForm from '@/components/admin/ContentForm';

type ContentType = 'pages' | 'faqs' | 'campaigns' | 'blog';

export default function AdminContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentType>('pages');
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [faqs, setFaqs] = useState<GeneralFaq[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    // Check admin authentication
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin');
      return;
    }

    fetchData();
  }, [activeTab, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'pages':
          endpoint = '/api/pages';
          break;
        case 'faqs':
          endpoint = '/api/general-faqs';
          break;
        case 'campaigns':
          endpoint = '/api/campaigns';
          break;
        case 'blog':
          endpoint = '/api/blog';
          break;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        switch (activeTab) {
          case 'pages':
            setPages(data.pages || []);
            break;
          case 'faqs':
            setFaqs(data.faqs || []);
            break;
          case 'campaigns':
            setCampaigns(data.campaigns || []);
            break;
          case 'blog':
            setBlogPosts(data.posts || []);
            break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">İçerik Yönetimi</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="admin-button-secondary"
            >
              Dashboard'a Dön
            </button>
            <button
              onClick={handleLogout}
              className="admin-button-danger"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('pages')}
            className={`admin-tab ${activeTab === 'pages' ? 'active' : ''}`}
          >
            📄 Sayfalar
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`admin-tab ${activeTab === 'faqs' ? 'active' : ''}`}
          >
            ❓ Genel SSS
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`admin-tab ${activeTab === 'campaigns' ? 'active' : ''}`}
          >
            🎉 Kampanyalar
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`admin-tab ${activeTab === 'blog' ? 'active' : ''}`}
          >
            📝 Blog
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Add New Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {activeTab === 'pages' && 'Sayfalar'}
            {activeTab === 'faqs' && 'Genel SSS'}
            {activeTab === 'campaigns' && 'Kampanyalar'}
            {activeTab === 'blog' && 'Blog Yazıları'}
          </h2>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="admin-button"
          >
            + Yeni Ekle
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="admin-loading"></div>
            <p className="text-gray-400 mt-4">Yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Pages List */}
            {activeTab === 'pages' && (
              <div className="admin-grid">
                {pages.length === 0 ? (
                  <div className="admin-empty">
                    <div className="text-4xl mb-4">📄</div>
                    <h3>Henüz sayfa yok</h3>
                    <p>İlk sayfanızı oluşturmak için "Yeni Ekle" butonunu kullanın.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pages.map((page) => (
                      <div key={page.id} className="admin-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">
                              {page.title_tr}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">
                              Tür: {page.page_type} | Slug: /{page.slug}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Oluşturulma: {formatDate(page.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`admin-status ${page.published ? 'published' : 'draft'}`}>
                              {page.published ? '✅ Yayında' : '📝 Taslak'}
                            </span>
                            {page.featured && (
                              <span className="admin-status featured">
                                ⭐ Öne Çıkan
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingItem(page);
                                setShowForm(true);
                              }}
                              className="admin-button-small"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FAQs List */}
            {activeTab === 'faqs' && (
              <div className="admin-grid">
                {faqs.length === 0 ? (
                  <div className="admin-empty">
                    <div className="text-4xl mb-4">❓</div>
                    <h3>Henüz SSS yok</h3>
                    <p>İlk SSS'nizi oluşturmak için "Yeni Ekle" butonunu kullanın.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="admin-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">
                              {faq.question_tr}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {faq.answer_tr}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Sıra: {faq.display_order} | Oluşturulma: {formatDate(faq.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`admin-status ${faq.published ? 'published' : 'draft'}`}>
                              {faq.published ? '✅ Yayında' : '📝 Taslak'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingItem(faq);
                                setShowForm(true);
                              }}
                              className="admin-button-small"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Campaigns List */}
            {activeTab === 'campaigns' && (
              <div className="admin-grid">
                {campaigns.length === 0 ? (
                  <div className="admin-empty">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3>Henüz kampanya yok</h3>
                    <p>İlk kampanyanızı oluşturmak için "Yeni Ekle" butonunu kullanın.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="admin-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">
                              {campaign.title_tr}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {campaign.description_tr}
                            </p>
                            <div className="text-gray-500 text-xs">
                              {campaign.discount_percentage && (
                                <span className="mr-4">💰 %{campaign.discount_percentage} indirim</span>
                              )}
                              {campaign.valid_until && (
                                <span>🕐 Bitiş: {formatDate(campaign.valid_until)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`admin-status ${campaign.active ? 'published' : 'draft'}`}>
                              {campaign.active ? '✅ Aktif' : '❌ Pasif'}
                            </span>
                            {campaign.featured && (
                              <span className="admin-status featured">
                                ⭐ Öne Çıkan
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingItem(campaign);
                                setShowForm(true);
                              }}
                              className="admin-button-small"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blog Posts List */}
            {activeTab === 'blog' && (
              <div className="admin-grid">
                {blogPosts.length === 0 ? (
                  <div className="admin-empty">
                    <div className="text-4xl mb-4">📝</div>
                    <h3>Henüz blog yazısı yok</h3>
                    <p>İlk blog yazınızı oluşturmak için "Yeni Ekle" butonunu kullanın.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="admin-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">
                              {post.title_tr}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">
                              Slug: /{post.slug}
                              {post.category && ` | Kategori: ${post.category}`}
                            </p>
                            <p className="text-gray-500 text-xs">
                              👁️ {post.view_count} görüntüleme | Oluşturulma: {formatDate(post.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`admin-status ${post.published ? 'published' : 'draft'}`}>
                              {post.published ? '✅ Yayında' : '📝 Taslak'}
                            </span>
                            {post.featured && (
                              <span className="admin-status featured">
                                ⭐ Öne Çıkan
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingItem(post);
                                setShowForm(true);
                              }}
                              className="admin-button-small"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ContentForm
          type={activeTab}
          item={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}