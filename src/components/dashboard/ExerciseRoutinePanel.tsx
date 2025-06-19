'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';
import { supabase } from '@/lib/supabase';

interface ExerciseRoutinePanelProps {
  patient: Patient;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty_id: number;
  difficulty?: {
    name: string;
  };
}

interface ExercisePlan {
  id: string;
  patient_id: string;
  exercise_id: string;
  frequency: string;
  duration_min: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  exercise?: Exercise;
}

interface AvailableExercise {
  id: string;
  name: string;
  description: string;
  difficulty_id: number;
  difficulty?: {
    name: string;
  };
}

export function ExerciseRoutinePanel({ patient }: ExerciseRoutinePanelProps) {
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExercisePlan | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<AvailableExercise[]>([]);
  const [selectedAvailableExercise, setSelectedAvailableExercise] = useState<AvailableExercise | null>(null);
  const [newPlanData, setNewPlanData] = useState({
    frequency: '',
    duration_min: 30,
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (patient?.id) {
      fetchExercisePlans();
      fetchAvailableExercises();
    }
  }, [patient?.id]);

  const fetchExercisePlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercise_plans')
        .select(`
          *,
          exercises (
            id,
            name,
            description,
            difficulty_id,
            exercise_difficulties (
              name
            )
          )
        `)
        .eq('patient_id', patient.id)
        .eq('is_deleted', false)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Process the data to properly structure difficulty information
      const processedData = (data || []).map(plan => ({
        ...plan,
        exercise: plan.exercises ? {
          ...plan.exercises,
          difficulty: plan.exercises.exercise_difficulties
        } : null
      }));

      setExercisePlans(processedData);
    } catch (error) {
      console.error('Egzersiz planları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          id,
          name,
          description,
          difficulty_id,
          exercise_difficulties (
            name
          )
        `)
        .order('name');

      if (error) throw error;

      const mappedExercises = data?.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        difficulty_id: exercise.difficulty_id,
        difficulty: Array.isArray(exercise.exercise_difficulties)
          ? exercise.exercise_difficulties[0]
          : exercise.exercise_difficulties
      })) || [];

      setAvailableExercises(mappedExercises);
    } catch (error) {
      console.error('Mevcut egzersizler getirilemedi:', error);
    }
  };

  const getDifficultyColor = (difficultyName: string) => {
    switch (difficultyName?.toLowerCase()) {
      case 'easy':
      case 'kolay': return 'bg-green-100 text-green-800';
      case 'medium':
      case 'orta': return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'zor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficultyName: string) => {
    switch (difficultyName?.toLowerCase()) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return difficultyName || 'Belirsiz';
    }
  };

  const isActive = (plan: ExercisePlan) => {
    const now = new Date();
    const startDate = new Date(plan.start_date);
    const endDate = plan.end_date ? new Date(plan.end_date) : null;

    return startDate <= now && (!endDate || endDate >= now);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}s`;
  };

  const currentPlans = exercisePlans.filter(plan => isActive(plan));

  const handleCompleteExercise = async (exercisePlanId: string) => {
    try {
      const { error } = await supabase
        .from('exercise_plans')
        .update({ end_date: new Date().toISOString() })
        .eq('id', exercisePlanId);

      if (error) throw error;

      await fetchExercisePlans();
      setShowExerciseModal(false);
      alert('Egzersiz tamamlandı olarak işaretlendi!');
    } catch (error) {
      console.error('Egzersiz tamamlanamadı:', error);
      alert('Egzersiz tamamlanırken bir hata oluştu.');
    }
  };

  const handleRemoveExercise = async (exercisePlanId: string) => {
    if (!confirm('Bu egzersizi hastanın planından çıkarmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exercise_plans')
        .delete()
        .eq('id', exercisePlanId);

      if (error) throw error;

      await fetchExercisePlans();
      setShowExerciseModal(false);
      alert('Egzersiz başarıyla kaldırıldı!');
    } catch (error) {
      console.error('Egzersiz kaldırılamadı:', error);
      alert('Egzersiz kaldırılırken bir hata oluştu.');
    }
  };

  const handleAddExercise = async () => {
    if (!selectedAvailableExercise || !newPlanData.frequency) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const { error } = await supabase
        .from('exercise_plans')
        .insert([
          {
            patient_id: patient.id,
            exercise_id: selectedAvailableExercise.id,
            frequency: newPlanData.frequency,
            duration_min: newPlanData.duration_min,
            start_date: newPlanData.start_date
          }
        ]);

      if (error) throw error;

      await fetchExercisePlans();
      setShowAddModal(false);
      setSelectedAvailableExercise(null);
      setNewPlanData({
        frequency: '',
        duration_min: 30,
        start_date: new Date().toISOString().split('T')[0]
      });
      alert('Egzersiz başarıyla eklendi!');
    } catch (error) {
      console.error('Egzersiz eklenemedi:', error);
      alert('Egzersiz eklenirken bir hata oluştu.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Başlık */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Egzersiz Rutini</h3>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Egzersiz planları yükleniyor...</p>
          </div>
        </div>
      ) : exercisePlans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="text-gray-400 mb-4">
            <ClockIcon className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz egzersiz planı yok</h3>
          <p className="text-gray-500 mb-4">Bu hasta için henüz bir egzersiz planı oluşturulmamış.</p>
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchAvailableExercises();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <PlusIcon className="w-4 h-4" />
            <span>İlk Egzersizi Ekle</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {/* Egzersiz Ekleme Butonu */}
            <button
              onClick={() => {
                setShowAddModal(true);
                fetchAvailableExercises();
              }}
              className="w-full p-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="font-medium">Yeni Egzersiz Ekle</span>
            </button>

            {/* Aktif Planlar */}
            {currentPlans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Aktif Planlar</h4>
                {currentPlans.map((plan) => (
                  <div key={plan.id} className="border border-green-200 bg-green-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {plan.exercise?.name || 'Egzersiz Planı'}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          {plan.exercise?.description || 'Açıklama bulunmuyor'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                        Aktif
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          📅
                          {new Date(plan.start_date).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDuration(plan.duration_min)}
                        </span>
                        {plan.frequency && (
                          <span>{plan.frequency}</span>
                        )}
                      </div>
                    </div>

                    {plan.exercise && (
                      <div className="bg-white rounded p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {plan.exercise.difficulty && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(plan.exercise.difficulty.name)}`}>
                                {getDifficultyText(plan.exercise.difficulty.name)}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{formatDuration(plan.duration_min)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1 text-xs"
                        onClick={async () => {
                          try {
                            const today = new Date().toISOString().split('T')[0];
                            const { error } = await supabase
                              .from('exercise_plans')
                              .update({
                                end_date: today
                              })
                              .eq('id', plan.id);

                            if (error) throw error;

                            // Refresh exercise plans
                            fetchExercisePlans();
                            alert('Egzersiz tamamlandı olarak işaretlendi.');
                          } catch (error) {
                            console.error('Egzersiz güncellenirken hata:', error);
                            alert('Egzersiz güncellenirken hata oluştu.');
                          }
                        }}
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Tamamlandı</span>
                      </button>
                      <button
                        className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 text-xs"
                        onClick={() => {
                          setSelectedExercise(plan);
                          setShowExerciseModal(true);
                        }}
                      >
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tamamlanmış Planlar */}
            {exercisePlans.filter(plan => !isActive(plan)).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-6">Tamamlanmış Planlar</h4>
                {exercisePlans.filter(plan => !isActive(plan)).map((plan) => (
                  <div key={plan.id} className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-700 text-sm">
                          {plan.exercise?.name || 'Egzersiz Planı'}
                        </h5>
                        <p className="text-xs text-gray-500 mb-2">
                          {plan.exercise?.description || 'Açıklama bulunmuyor'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 ml-2">
                        Tamamlandı
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span className="flex items-center">
                          📅
                          {new Date(plan.start_date).toLocaleDateString('tr-TR')}
                        </span>
                        {plan.end_date && (
                          <span className="flex items-center">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            {new Date(plan.end_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDuration(plan.duration_min)}
                        </span>
                        {plan.frequency && (
                          <span>{plan.frequency}</span>
                        )}
                      </div>
                    </div>

                    {plan.exercise && (
                      <div className="bg-white rounded p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {plan.exercise.difficulty && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(plan.exercise.difficulty.name)} opacity-70`}>
                                {getDifficultyText(plan.exercise.difficulty.name)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{formatDuration(plan.duration_min)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-xs"
                        onClick={() => {
                          setSelectedExercise(plan);
                          setShowExerciseModal(true);
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
        </div>
      )}

      {/* Egzersiz Detayları Modal */}
      {showExerciseModal && selectedExercise && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Egzersiz Detayları</h3>
                <button
                  onClick={() => {
                    setShowExerciseModal(false);
                    setSelectedExercise(null);
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
                {/* Egzersiz Adı ve Durum */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {selectedExercise.exercise?.name || 'Egzersiz Planı'}
                    </h4>
                    <div className="flex space-x-2">
                      {selectedExercise.exercise?.difficulty && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedExercise.exercise.difficulty.name)}`}>
                          {getDifficultyText(selectedExercise.exercise.difficulty.name)}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isActive(selectedExercise) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive(selectedExercise) ? 'Aktif' : 'Tamamlandı'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Açıklama */}
                {selectedExercise.exercise?.description && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Açıklama</h5>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                      {selectedExercise.exercise.description}
                    </p>
                  </div>
                )}

                {/* Egzersiz Detayları */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 mb-1">Süre</h5>
                    <p className="text-blue-800 text-lg font-semibold">
                      {formatDuration(selectedExercise.duration_min)}
                    </p>
                  </div>

                  {selectedExercise.frequency && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h5 className="font-medium text-purple-900 mb-1">Sıklık</h5>
                      <p className="text-purple-800">{selectedExercise.frequency}</p>
                    </div>
                  )}
                </div>

                {/* Tarih Bilgileri */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h5 className="font-medium text-green-900 mb-1">Başlangıç Tarihi</h5>
                    <p className="text-green-800">
                      {new Date(selectedExercise.start_date).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {selectedExercise.end_date && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <h5 className="font-medium text-red-900 mb-1">Bitiş Tarihi</h5>
                      <p className="text-red-800">
                        {new Date(selectedExercise.end_date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 mb-1">Oluşturulma Tarihi</h5>
                    <p className="text-gray-700">
                      {new Date(selectedExercise.created_at || selectedExercise.start_date).toLocaleDateString('tr-TR', {
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
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
                {isActive(selectedExercise) && (
                  <button
                    onClick={() => handleCompleteExercise(selectedExercise.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tamamlandı İşaretle
                  </button>
                )}
                <button
                  onClick={() => handleRemoveExercise(selectedExercise.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Planından Çıkar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Egzersiz Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Egzersiz Ekle</h3>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Egzersiz Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Egzersiz Seçin
                </label>
                <select
                  value={selectedAvailableExercise?.id || ''}
                  onChange={(e) => {
                    const exercise = availableExercises.find(ex => ex.id === e.target.value);
                    setSelectedAvailableExercise(exercise || null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">Egzersiz seçin...</option>
                  {availableExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id} className="text-gray-900">
                      {exercise.name} - {exercise.difficulty?.name || 'Belirsiz'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seçilen Egzersiz Açıklaması */}
              {selectedAvailableExercise && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{selectedAvailableExercise.description}</p>
                </div>
              )}

              {/* Sıklık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıklık
                </label>
                <select
                  value={newPlanData.frequency}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">Sıklık seçin...</option>
                  <option value="günlük" className="text-gray-900">Günlük</option>
                  <option value="haftada 2 kez" className="text-gray-900">Haftada 2 kez</option>
                  <option value="haftada 3 kez" className="text-gray-900">Haftada 3 kez</option>
                  <option value="haftalık" className="text-gray-900">Haftalık</option>
                </select>
              </div>

              {/* Süre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Süre (dakika)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={newPlanData.duration_min}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, duration_min: parseInt(e.target.value) || 30 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Başlangıç Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={newPlanData.start_date}
                  onChange={(e) => setNewPlanData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedAvailableExercise(null);
                    setNewPlanData({
                      frequency: '',
                      duration_min: 30,
                      start_date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddExercise}
                  disabled={!selectedAvailableExercise || !newPlanData.frequency}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}