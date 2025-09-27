'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { signUp, signIn, user } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If user is already logged in, redirect to profile
  if (user) {
    router.push('/profile');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { user, error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        if (user) {
          setSuccess(t('loginSuccess') + ' ' + t('redirecting'));
          router.push('/profile');
        }
      } else {
        const { user, error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        });
        if (error) throw error;
        if (user) {
          setSuccess(t('signupSuccess'));
        }
      }
    } catch (err: any) {
      setError(err.message || (isLogin ? t('loginError') : t('signupError')));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-20" style={{background: 'var(--dark-bg)'}}>
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-xl mb-4" style={{color: 'var(--dark-text)'}}>
              {isLogin ? t('login') : t('signup')}
            </h1>
            <p className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
              {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
            </p>
          </div>

          {/* Auth Form */}
          <div className="service-card p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                        {t('firstName')}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                          background: 'var(--dark-bg-secondary)',
                          borderColor: 'var(--neutral-700)',
                          color: 'var(--dark-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                        {t('lastName')}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                          background: 'var(--dark-bg-secondary)',
                          borderColor: 'var(--neutral-700)',
                          color: 'var(--dark-text)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        background: 'var(--dark-bg-secondary)',
                        borderColor: 'var(--neutral-700)',
                        color: 'var(--dark-text)'
                      }}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                  {t('password')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {loading ? tCommon('loading') : (isLogin ? t('loginButton') : t('signupButton'))}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {isLogin 
                  ? t('switchToSignup') 
                  : t('switchToLogin')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}