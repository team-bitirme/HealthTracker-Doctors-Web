import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  session: Session | null;
  user: User | null;

  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  isLoading: false,
  isInitialized: false,
  session: null,
  user: null,

  // Sign in action
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        set({
          session: data.session,
          user: data.user,
          isLoading: false,
        });

        console.log('✅ Kullanıcı başarıyla giriş yaptı:', data.user.email);
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: 'Giriş başarısız' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Sign out action
  signOut: async () => {
    set({ isLoading: true });

    try {
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        isLoading: false,
      });

      console.log('✅ Kullanıcı başarıyla çıkış yaptı');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
      set({ isLoading: false });
    }
  },

  // Reset password action
  resetPassword: async (email: string) => {
    set({ isLoading: true });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      set({ isLoading: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Update password action
  updatePassword: async (newPassword: string) => {
    set({ isLoading: true });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      set({ isLoading: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({
          session,
          user: session.user,
          isInitialized: true,
        });

        console.log('🔐 Mevcut oturum bulundu:', session.user.email);
      } else {
        set({
          session: null,
          user: null,
          isInitialized: true,
        });

        console.log('🔓 Aktif oturum bulunamadı');
      }

      // Listen to auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth durumu değişti:', event, session?.user?.email);

        if (session) {
          set({
            session,
            user: session.user,
          });
        } else {
          set({
            session: null,
            user: null,
          });
        }
      });

    } catch (error) {
      console.error('❌ Auth başlatma hatası:', error);
      set({
        session: null,
        user: null,
        isInitialized: true,
      });
    }
  },

  // Set session manually
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
    });
  },
}));