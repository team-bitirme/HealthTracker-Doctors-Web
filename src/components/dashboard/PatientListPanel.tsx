'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface PatientListPanelProps {
  onPatientSelect: (patient: Patient | null) => void;
  selectedPatient: Patient | null;
}

export function PatientListPanel({ onPatientSelect, selectedPatient }: PatientListPanelProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      // First get the doctor's ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      // Then get patients through doctor_patients relationship
      const { data: doctorPatients, error: dpError } = await supabase
        .from('doctor_patients')
        .select(`
          patients (
            id,
            name,
            surname,
            birth_date,
            patient_note,
            created_at,
            users (
              email
            ),
            genders (
              name
            )
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('is_deleted', false);

      if (dpError) throw dpError;

      // Transform the data to match Patient interface
      const transformedPatients: Patient[] = (doctorPatients || []).map(dp => {
        const patient = dp.patients;
        if (!patient) return null;

        const age = patient.birth_date
          ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear()
          : 0;

        return {
          id: patient.id,
          name: patient.name || '',
          surname: patient.surname || '',
          age,
          diagnosis: patient.patient_note || undefined,
          email: patient.users?.email || undefined,
          lastVisit: new Date(patient.created_at).toLocaleDateString('tr-TR'),
          status: 'active' as const
        };
      }).filter(Boolean) as Patient[];

      setPatients(transformedPatients);
    } catch (error) {
      console.error('Hastalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Başlık */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Hastalar</h3>
        <p className="text-sm text-gray-500 mt-1">{patients.length} hasta</p>
      </div>

      {/* Arama */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hasta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Hasta Listesi */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-4 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Arama kriterinize uygun hasta bulunamadı' : 'Henüz hasta bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => onPatientSelect(patient)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedPatient?.id === patient.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(patient.name, patient.surname)}
                      </span>
                    </div>
                  </div>

                  {/* Hasta Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.name} {patient.surname}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {patient.age} yaş
                      </p>
                      {patient.lastVisit && (
                        <p className="text-xs text-gray-500">
                          {patient.lastVisit}
                        </p>
                      )}
                    </div>

                    {patient.diagnosis && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {patient.diagnosis}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Alt Kısım - Yeni Hasta Ekle */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Yeni Hasta Ekle
        </button>
      </div>
    </div>
  );
}