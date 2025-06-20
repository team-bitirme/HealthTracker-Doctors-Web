'use client';

import { UserCircleIcon, ChartBarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';
import { useLLMStore } from '@/store/llmStore';

interface DashboardHeaderProps {
  selectedPatient: Patient | null;
  doctorName: string;
}

export function DashboardHeader({ selectedPatient, doctorName }: DashboardHeaderProps) {
  const { toggleSidebar } = useLLMStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Sol kısım - Hasta/Genel bilgi */}
        <div className="flex items-center space-x-4">
          {selectedPatient ? (
            <>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {selectedPatient.name.charAt(0)}{selectedPatient.surname.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedPatient.name} {selectedPatient.surname}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{selectedPatient.age} yaş</span>
                  {selectedPatient.diagnosis && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedPatient.diagnosis}
                    </span>
                  )}
                  {selectedPatient.lastVisit && (
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Son ziyaret: {selectedPatient.lastVisit}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <ChartBarIcon className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Genel Dashboard</h1>
                <p className="text-sm text-gray-600">Hasta istatistikleri ve özet bilgiler</p>
              </div>
            </>
          )}
        </div>

        {/* Sağ kısım - Doktor bilgisi ve AI Asistan */}
        <div className="flex items-center space-x-4">
          {/* AI Asistan Butonu */}
          <button
            onClick={toggleSidebar}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            title="AI Asistan"
          >
            <SparklesIcon className="w-5 h-5" />
            <span className="text-sm font-medium">AI Asistan</span>
          </button>

          {/* Doktor Bilgisi */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Hoş geldiniz,</span>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <span className="font-medium text-gray-900">{doctorName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}