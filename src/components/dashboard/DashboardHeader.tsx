'use client';

import { UserCircleIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';

interface DashboardHeaderProps {
  selectedPatient: Patient | null;
  doctorName: string;
}

export function DashboardHeader({ selectedPatient, doctorName }: DashboardHeaderProps) {
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

        {/* Sağ kısım - Doktor bilgisi */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Hoş geldiniz,</span>
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <span className="font-medium text-gray-900">{doctorName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}