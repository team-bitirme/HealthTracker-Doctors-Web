'use client';

import { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { doctorService, PatientFormData } from '@/services/doctorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AddPatientPanelProps {
  onBack: () => void;
  onSuccess: () => void;
  doctorId: string;
}

export function AddPatientPanel({ onBack, onSuccess, doctorId }: AddPatientPanelProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    email: '',
    password: '',
    name: '',
    surname: '',
    birth_date: new Date().toISOString().split('T')[0],
    gender: 'male',
    patient_note: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'E-posta adresi gereklidir';
    if (!formData.password.trim()) return 'Şifre gereklidir';
    if (formData.password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
    if (!formData.name.trim()) return 'Ad gereklidir';
    if (!formData.surname.trim()) return 'Soyad gereklidir';
    if (!formData.gender) return 'Cinsiyet seçimi gereklidir';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Geçerli bir e-posta adresi giriniz';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await doctorService.addPatient(doctorId, formData);

      if (result.success) {
        // Reset form
        setFormData({
          email: '',
          password: '',
          name: '',
          surname: '',
          birth_date: new Date().toISOString().split('T')[0],
          gender: 'male',
          patient_note: '',
        });
        onSuccess();
        onBack(); // Panel'i kapat
      } else {
        setError(result.error || 'Hasta eklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Yeni Hasta Ekle</h3>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Hesap Bilgileri */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Hesap Bilgileri</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="hasta@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Kişisel Bilgiler</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    placeholder="Soyad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğum Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cinsiyet *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'male')}
                    className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                      formData.gender === 'male'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    👨 Erkek
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'female')}
                    className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                      formData.gender === 'female'
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    👩 Kadın
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta Notu (İsteğe bağlı)
                </label>
                <textarea
                  value={formData.patient_note}
                  onChange={(e) => handleInputChange('patient_note', e.target.value)}
                  placeholder="Hasta hakkında notlar..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 inline-flex items-center justify-center"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {isLoading ? 'Ekleniyor...' : 'Hasta Ekle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}