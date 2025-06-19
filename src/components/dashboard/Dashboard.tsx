'use client';

import { useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { PatientListPanel } from './PatientListPanel';
import { DashboardHeader } from './DashboardHeader';
import { PatientInfoPanel } from './PatientInfoPanel';
import { ExerciseRoutinePanel } from './ExerciseRoutinePanel';
import { ChatPanel } from './ChatPanel';
import { GeneralDashboard } from './GeneralDashboard';
import { HomeIcon } from '@heroicons/react/24/outline';

export interface Patient {
  id: string;
  name: string;
  surname: string;
  age: number;
  diagnosis?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  lastVisit?: string;
  status: 'active' | 'inactive';
}

export function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { profile } = useProfileStore();

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
  };

  const handleBackToGeneral = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Üst Panel - Tüm uygulama genişliğinde */}
      <div className="flex items-center bg-white border-b border-gray-200 flex-shrink-0">
        {/* Genel Dashboard Butonu */}
        <div className="flex-shrink-0 p-4 border-r border-gray-200">
          <button
            onClick={handleBackToGeneral}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedPatient === null
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
            title="Genel Dashboard"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="font-medium">Genel</span>
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="flex-1">
          <DashboardHeader
            selectedPatient={selectedPatient}
            doctorName={profile?.name || 'Dr. Kullanıcı'}
          />
        </div>
      </div>

      {/* Alt Panel - Sol hasta listesi + sağ ana içerik */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel - Hasta Listesi */}
        <div className="w-80 flex-shrink-0">
          <PatientListPanel
            onPatientSelect={handlePatientSelect}
            selectedPatient={selectedPatient}
          />
        </div>

        {/* Ana İçerik Alanı */}
        <div className="flex-1 overflow-hidden">
          {selectedPatient === null ? (
            // Genel Dashboard
            <GeneralDashboard />
          ) : (
            // Hasta Seçildiğinde 3 Bölge - Optimize edilmiş genişlik dağılımı
            <div className="h-full flex">
              {/* Sol Bölge - Hasta Bilgileri (daha geniş) */}
              <div className="w-2/5 border-r border-gray-200">
                <PatientInfoPanel patient={selectedPatient} />
              </div>

              {/* Orta Bölge - Egzersiz Rutini */}
              <div className="w-1/3 border-r border-gray-200">
                <ExerciseRoutinePanel patient={selectedPatient} />
              </div>

              {/* Sağ Bölge - Sohbet (daha dar) */}
              <div className="w-1/4">
                <ChatPanel patient={selectedPatient} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}