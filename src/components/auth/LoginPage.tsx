'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DEV_USER } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { signIn, isLoading } = useAuthStore();

  useEffect(() => {
    // Development modunda otomatik doldur
    if (process.env.NODE_ENV === 'development') {
      setEmail(DEV_USER.email);
      setPassword(DEV_USER.password);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen email ve şifre alanlarını doldurun.');
      return;
    }

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error || 'Bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 flex items-center justify-center bg-blue-600 rounded-full">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Diyabet Takip
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Doktor paneline giriş yapın
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => {
                // TODO: Implement forgot password
                alert('Şifre sıfırlama özelliği yakında eklenecek');
              }}
            >
              Şifremi unuttum
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}