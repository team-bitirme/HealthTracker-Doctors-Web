'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';
import { supabase } from '@/lib/supabase';

interface PatientInfoPanelProps {
  patient: Patient;
}

interface HealthMeasurement {
  id: string;
  measurement_type_id: number;
  value: number;
  method: string;
  measured_at: string;
  measurement_type?: {
    name: string;
    unit: string;
  };
}

interface Complaint {
  id: string;
  patient_id: string;
  description: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
  subcategory?: {
    name: string;
    priority_level: string;
  };
}

export function PatientInfoPanel({ patient }: PatientInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'complaints'>('info');
  const [healthMeasurements, setHealthMeasurements] = useState<HealthMeasurement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
    fetchHealthMeasurements();
    fetchComplaints();
  }, [patient.id]);

  const fetchHealthMeasurements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          *,
          measurement_types (
            name,
            unit
          )
        `)
        .eq('patient_id', patient.id)
        .order('measured_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process the data to properly structure measurement_type information
      const processedData = (data || []).map(measurement => ({
        ...measurement,
        measurement_type: Array.isArray(measurement.measurement_types)
          ? measurement.measurement_types[0]
          : measurement.measurement_types
      }));

      setHealthMeasurements(processedData);
    } catch (error) {
      console.error('Sağlık ölçümleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          complaint_subcategories (
            name,
            priority_level
          )
        `)
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to properly structure subcategory information
      const processedData = (data || []).map(complaint => ({
        ...complaint,
        subcategory: Array.isArray(complaint.complaint_subcategories)
          ? complaint.complaint_subcategories[0]
          : complaint.complaint_subcategories
      }));

      setComplaints(processedData);
    } catch (error) {
      console.error('Şikayetler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'info', name: 'Genel', icon: UserIcon },
    { id: 'medical', name: 'Sağlık', icon: ChartBarIcon },
    { id: 'complaints', name: 'Şikayetler', icon: ClipboardDocumentListIcon }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Belirsiz';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Başlık */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Hasta Bilgileri</h3>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Kişisel Bilgiler - Grid Layout */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Kişisel Bilgiler</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Ad Soyad</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.name} {patient.surname}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Yaş</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{patient.age}</span>
                </div>

                {patient.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Telefon</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{patient.phone}</span>
                  </div>
                )}

                {patient.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">E-posta</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{patient.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teşhis */}
            {patient.diagnosis && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">Teşhis</h4>
                <p className="text-sm text-blue-800">{patient.diagnosis}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medical' && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : healthMeasurements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Henüz ölçüm bulunmuyor</div>
            ) : (
              <div className="space-y-2">
                {healthMeasurements.map((measurement) => (
                  <div key={measurement.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 text-sm">
                            {measurement.measurement_type?.name || 'Bilinmeyen Ölçüm'}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {new Date(measurement.measured_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-lg font-semibold text-blue-600">
                            {measurement.value} {measurement.measurement_type?.unit || ''}
                          </p>
                          {measurement.method && (
                            <p className="text-xs text-gray-500">{measurement.method}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Henüz şikayet bulunmuyor</div>
            ) : (
              <div className="space-y-2">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {complaint.subcategory?.name || 'Genel Şikayet'}
                      </h5>
                      <div className="flex space-x-1">
                        {complaint.subcategory?.priority_level && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(complaint.subcategory.priority_level)}`}>
                            {getPriorityText(complaint.subcategory.priority_level)}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          complaint.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {complaint.is_active ? 'Aktif' : 'Çözüldü'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Başlangıç: {new Date(complaint.start_date).toLocaleDateString('tr-TR')}</span>
                        {complaint.end_date && (
                          <span>Bitiş: {new Date(complaint.end_date).toLocaleDateString('tr-TR')}</span>
                        )}
                      </div>
                    </div>

                                        {/* Action Buttons */}
                    <div className="flex justify-center pt-2 border-t border-gray-100">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowComplaintModal(true);
                        }}
                      >
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


      </div>

      {/* Şikayet Detayları Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Şikayet Detayları</h3>
                <button
                  onClick={() => {
                    setShowComplaintModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* Kategori ve Durum */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {selectedComplaint.subcategory?.name || 'Genel Şikayet'}
                    </h4>
                    <div className="flex space-x-2">
                      {selectedComplaint.subcategory?.priority_level && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedComplaint.subcategory.priority_level)}`}>
                          {getPriorityText(selectedComplaint.subcategory.priority_level)}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedComplaint.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedComplaint.is_active ? 'Aktif' : 'Çözüldü'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Açıklama</h5>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Tarih Bilgileri */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 mb-1">Başlangıç Tarihi</h5>
                    <p className="text-blue-800">
                      {new Date(selectedComplaint.start_date).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {selectedComplaint.end_date && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h5 className="font-medium text-green-900 mb-1">Bitiş Tarihi</h5>
                      <p className="text-green-800">
                        {new Date(selectedComplaint.end_date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 mb-1">Kayıt Tarihi</h5>
                    <p className="text-gray-700">
                      {new Date(selectedComplaint.created_at).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowComplaintModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Kapat
                </button>

                {selectedComplaint.is_active && (
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('complaints')
                          .update({
                            is_active: false,
                            end_date: new Date().toISOString().split('T')[0]
                          })
                          .eq('id', selectedComplaint.id);

                        if (error) throw error;

                        // Refresh complaints and close modal
                        await fetchComplaints();
                        setShowComplaintModal(false);
                        setSelectedComplaint(null);
                        alert('Şikayet çözüldü olarak işaretlendi.');
                      } catch (error) {
                        console.error('Şikayet güncellenirken hata:', error);
                        alert('Şikayet güncellenirken hata oluştu.');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Çözüldü İşaretle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}