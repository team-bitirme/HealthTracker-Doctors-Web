'use client';

import { useState, useRef, useCallback } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { PatientListPanel } from './PatientListPanel';
import { DashboardHeader } from './DashboardHeader';
import { PatientInfoPanel } from './PatientInfoPanel';
import { ExerciseRoutinePanel } from './ExerciseRoutinePanel';
import { ChatPanel } from './ChatPanel';
import { GeneralDashboard } from './GeneralDashboard';
import { AddPatientPanel } from './AddPatientPanel';
import { ResizableHandle } from '@/components/ui/ResizableHandle';
import { useResizable } from '@/hooks/useResizable';
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

type ViewMode = 'general' | 'patient' | 'addPatient';

export function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('general');
  const [refreshPatients, setRefreshPatients] = useState(0); // Counter to trigger refresh
  const { profile } = useProfileStore();

  // Panel width constraints
  const MIN_PANEL_WIDTH = 20;
  const MAX_PANEL_WIDTH = 60;

  // Resizable panels - Define them first without callbacks
  const leftPanel = useResizable({
    initialWidth: 40, // 40% (equivalent to w-2/5)
    minWidth: MIN_PANEL_WIDTH,
    maxWidth: MAX_PANEL_WIDTH
  });

  const middlePanel = useResizable({
    initialWidth: 33, // 33% (equivalent to w-1/3)
    minWidth: MIN_PANEL_WIDTH,
    maxWidth: MAX_PANEL_WIDTH
  });

  // Right panel width is calculated as the remaining space
  const rightPanelWidth = Math.max(100 - leftPanel.width - middlePanel.width, MIN_PANEL_WIDTH);

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    setViewMode(patient ? 'patient' : 'general');
  };

  const handleBackToGeneral = () => {
    setSelectedPatient(null);
    setViewMode('general');
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setViewMode('addPatient');
  };

  const handleAddPatientSuccess = () => {
    // Trigger patient list refresh
    setRefreshPatients(prev => prev + 1);
  };

  const handleAddPatientBack = () => {
    setViewMode('general');
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
              viewMode === 'general'
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
            onAddPatient={handleAddPatient}
            refreshTrigger={refreshPatients}
          />
        </div>

        {/* Ana İçerik Alanı */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'general' ? (
            // Genel Dashboard
            <GeneralDashboard />
          ) : viewMode === 'addPatient' ? (
            // Hasta Ekleme Paneli
            <AddPatientPanel
              onBack={handleAddPatientBack}
              onSuccess={handleAddPatientSuccess}
              doctorId={profile?.id || ''}
            />
          ) : (
            // Hasta Seçildiğinde 3 Resizable Bölge
            <div className="h-full flex">
              {/* Sol Bölge - Hasta Bilgileri */}
              <div
                className="overflow-hidden flex-shrink-0"
                style={{ width: `${leftPanel.width}%` }}
              >
                <PatientInfoPanel patient={selectedPatient!} />
              </div>

              {/* İlk Resizable Handle */}
              <ResizableHandle
                onMouseDown={leftPanel.handleMouseDown}
                isDragging={leftPanel.isDragging}
              />

              {/* Orta Bölge - Egzersiz Rutini */}
              <div
                className="overflow-hidden flex-shrink-0"
                style={{ width: `${middlePanel.width}%` }}
              >
                <ExerciseRoutinePanel patient={selectedPatient!} />
              </div>

              {/* İkinci Resizable Handle */}
              <ResizableHandle
                onMouseDown={middlePanel.handleMouseDown}
                isDragging={middlePanel.isDragging}
              />

              {/* Sağ Bölge - Sohbet */}
              <div
                className="overflow-hidden flex-1"
                style={{ minWidth: `${MIN_PANEL_WIDTH}%` }}
              >
                <ChatPanel patient={selectedPatient!} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}