'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { user, isInitialized } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    if (user?.id) {
      console.log('🔐 Doktor girişi:', user.email);
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Auth henüz initialize olmamışsa loading göster
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasını göster
  if (!user) {
    return <LoginPage />;
  }

  // Kullanıcı giriş yapmışsa dashboard'u göster
  return <Dashboard />;
}
