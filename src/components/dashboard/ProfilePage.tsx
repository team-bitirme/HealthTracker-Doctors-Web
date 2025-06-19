'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { doctorService } from '@/services/doctorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Specialization {
  id: number;
  name: string;
}

export function ProfilePage() {
  const { profile, updateProfile, isLoading } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    specialization_id: 0,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        surname: profile.surname || '',
        specialization_id: 0, // TODO: Get from profile
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const specs = await doctorService.getSpecializations();
        setSpecializations(specs);
      } catch (error) {
        console.error('Uzmanlık alanları yüklenirken hata:', error);
      }
    };

    loadSpecializations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    const success = await updateProfile(profile.id, formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        surname: profile.surname || '',
        specialization_id: 0,
      });
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kişisel bilgilerinizi görüntüleyip düzenleyin
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Dr. {profile.name} {profile.surname}
                </h3>
                <p className="text-sm text-gray-500">{profile.specialization_name || 'Uzmanlık belirtilmemiş'}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <div className="mt-5 sm:mt-0">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Düzenle
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Ad
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="surname"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Uzmanlık Alanı
                </label>
                <select
                  id="specialization"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.specialization_id}
                  onChange={(e) => setFormData({ ...formData, specialization_id: parseInt(e.target.value) })}
                >
                  <option value={0}>Seçiniz</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ad</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.name || 'Belirtilmemiş'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Soyad</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.surname || 'Belirtilmemiş'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uzmanlık</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.specialization_name || 'Belirtilmemiş'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hasta Sayısı</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.patient_count || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kayıt Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}