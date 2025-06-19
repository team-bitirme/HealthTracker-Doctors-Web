'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { doctorService } from '@/services/doctorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Patient {
  id: string;
  name: string | null;
  surname: string | null;
  birth_date: string | null;
  gender_name: string | null;
  patient_note: string | null;
  created_at: string | null;
}

export function PatientsPage() {
  const { profile } = useProfileStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      if (!profile?.id) return;

      setIsLoading(true);
      try {
        const patientsData = await doctorService.getDoctorPatients(profile.id);
        setPatients(patientsData);
      } catch (error) {
        console.error('Hastalar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [profile?.id]);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.name || ''} ${patient.surname || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const calculateAge = (birthDate: string | null): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve eylemler */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hastalar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {patients.length} hasta
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Hasta Ekle
          </button>
        </div>
      </div>

      {/* Arama */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hasta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Hasta listesi */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Hasta bulunamadı' : 'Henüz hasta yok'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Arama kriterlerinizi değiştirip tekrar deneyin.'
              : 'Size atanan hastalar burada görüntülenecek.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <li key={patient.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.name} {patient.surname}
                          </p>
                          <div className="flex items-center mt-1 space-x-4">
                            {patient.birth_date && (
                              <p className="text-sm text-gray-500">
                                {calculateAge(patient.birth_date)} yaş
                              </p>
                            )}
                            {patient.gender_name && (
                              <p className="text-sm text-gray-500">
                                {patient.gender_name}
                              </p>
                            )}
                            {patient.created_at && (
                              <p className="text-sm text-gray-500">
                                Kayıt: {format(new Date(patient.created_at), 'dd MMM yyyy', { locale: tr })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {patient.patient_note && (
                        <p className="mt-2 text-sm text-gray-500 truncate">
                          {patient.patient_note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Detaylar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}