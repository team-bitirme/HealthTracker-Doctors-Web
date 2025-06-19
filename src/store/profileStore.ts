import { create } from 'zustand';
import { doctorService, DoctorProfile } from '@/services/doctorService';

interface ProfileState {
  // State
  profile: DoctorProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (doctorId: string, updates: {
    name?: string;
    surname?: string;
    specialization_id?: number;
  }) => Promise<boolean>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  isLoading: false,
  error: null,

  // Fetch profile action
  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const profile = await doctorService.getDoctorProfile(userId);

      if (profile) {
        set({
          profile,
          isLoading: false,
          error: null
        });
        console.log('✅ Profile store güncellendi:', profile);
      } else {
        set({
          profile: null,
          isLoading: false,
          error: 'Doktor profili bulunamadı'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil yüklenirken hata oluştu';
      set({
        profile: null,
        isLoading: false,
        error: errorMessage
      });
      console.error('❌ Profile fetch hatası:', error);
    }
  },

  // Update profile action
  updateProfile: async (doctorId: string, updates: {
    name?: string;
    surname?: string;
    specialization_id?: number;
  }) => {
    const { profile } = get();

    if (!profile) {
      console.error('❌ Güncellenecek profil bulunamadı');
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const success = await doctorService.updateDoctorProfile(doctorId, updates);

      if (success) {
        // Local state'i güncelle
        const updatedProfile = {
          ...profile,
          ...updates,
        };

        set({
          profile: updatedProfile,
          isLoading: false,
          error: null
        });

        console.log('✅ Profile başarıyla güncellendi:', updatedProfile);
        return true;
      } else {
        set({
          isLoading: false,
          error: 'Profil güncellenirken hata oluştu'
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil güncellenirken hata oluştu';
      set({
        isLoading: false,
        error: errorMessage
      });
      console.error('❌ Profile update hatası:', error);
      return false;
    }
  },

  // Clear profile action
  clearProfile: () => {
    set({
      profile: null,
      isLoading: false,
      error: null,
    });
    console.log('🧹 Profile store temizlendi');
  },
}));