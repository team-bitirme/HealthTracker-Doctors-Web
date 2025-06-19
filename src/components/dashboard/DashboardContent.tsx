'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { doctorService } from '@/services/doctorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalPatients: number;
  unreadMessages: number;
  urgentComplaints: number;
  weeklyMeasurements: number;
}

export function DashboardContent() {
  const { profile } = useProfileStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    unreadMessages: 0,
    urgentComplaints: 0,
    weeklyMeasurements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profile?.id) return;

      setIsLoading(true);
      try {
        // Hasta sayısını al
        const patients = await doctorService.getDoctorPatients(profile.id);

        // TODO: Diğer istatistikleri yükle
        setStats({
          totalPatients: patients.length,
          unreadMessages: 5, // Placeholder
          urgentComplaints: 2, // Placeholder
          weeklyMeasurements: 34, // Placeholder
        });
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hoş geldiniz, Dr. {profile?.name} {profile?.surname}
        </p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Toplam Hasta
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalPatients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-blue-700 hover:text-blue-900">
                Tümünü görüntüle
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Okunmamış Mesaj
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.unreadMessages}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-blue-700 hover:text-blue-900">
                Mesajları görüntüle
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Acil Şikayet
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.urgentComplaints}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-yellow-700 hover:text-yellow-900">
                Şikayetleri görüntüle
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Haftalık Ölçüm
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.weeklyMeasurements}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-green-700 hover:text-green-900">
                Detayları görüntüle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Son aktiviteler */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Son Aktiviteler
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Mehmet Yılmaz kan şekeri ölçümü ekledi
                </p>
                <p className="text-xs text-gray-500">2 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Ayşe Demir size mesaj gönderdi
                </p>
                <p className="text-xs text-gray-500">4 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Ali Kaya yeni şikayet bildirdi
                </p>
                <p className="text-xs text-gray-500">6 saat önce</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı eylemler */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Hızlı Eylemler
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <UsersIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Yeni Hasta Ekle
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Sisteme yeni hasta kaydı oluşturun
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Mesaj Gönder
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Hastalarınıza mesaj gönderin
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Rapor Oluştur
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Hasta verileri raporu oluşturun
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}