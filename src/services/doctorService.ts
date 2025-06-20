import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/types/supabase';

export interface DoctorProfile {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  specialization_name: string | null;
  patient_count: number | null;
  created_at: string | null;
}

export interface DoctorWithPatients extends DoctorProfile {
  patients: {
    id: string;
    name: string | null;
    surname: string | null;
    birth_date: string | null;
    gender_name: string | null;
    patient_note: string | null;
    created_at: string | null;
  }[];
}

export interface PatientFormData {
  email: string;
  password: string;
  name: string;
  surname: string;
  birth_date: string;
  gender: 'male' | 'female';
  patient_note: string;
}

class DoctorService {
  /**
   * Doktor profilini user_id ile getir
   */
  async getDoctorProfile(userId: string): Promise<DoctorProfile | null> {
    console.log('🔍 Doktor profili getiriliyor...', { userId });

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          surname,
          patient_count,
          created_at,
          user_id,
          users!inner(email),
          specializations(name)
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('❌ Doktor profili getirme hatası:', {
          error: error.message,
          code: error.code,
          userId
        });
        return null;
      }

      if (!data) {
        console.warn('⚠️ Doktor profili bulunamadı:', { userId });
        return null;
      }

      const profile = {
        id: data.id,
        name: data.name,
        surname: data.surname,
        email: (data.users as any).email,
        specialization_name: data.specializations?.name || null,
        patient_count: data.patient_count,
        created_at: data.created_at,
      };

      console.log('✅ Doktor profili başarıyla getirildi:', {
        doctorId: profile.id,
        doctorName: `${profile.name} ${profile.surname}`,
        email: profile.email,
        specialization: profile.specialization_name,
        patientCount: profile.patient_count
      });

      return profile;
    } catch (error) {
      console.error('💥 Doktor profili getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        userId
      });
      return null;
    }
  }

  /**
   * Doktor ID ile doktor bilgilerini getir
   */
  async getDoctorById(doctorId: string): Promise<DoctorProfile | null> {
    console.log('🔍 Doktor bilgisi ID ile getiriliyor...', { doctorId });

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          surname,
          patient_count,
          created_at,
          user_id,
          users!inner(email),
          specializations(name)
        `)
        .eq('id', doctorId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('❌ Doktor bilgisi getirme hatası:', {
          error: error.message,
          code: error.code,
          doctorId
        });
        return null;
      }

      if (!data) {
        console.warn('⚠️ Doktor bulunamadı:', { doctorId });
        return null;
      }

      const profile = {
        id: data.id,
        name: data.name,
        surname: data.surname,
        email: (data.users as any).email,
        specialization_name: data.specializations?.name || null,
        patient_count: data.patient_count,
        created_at: data.created_at,
      };

      console.log('✅ Doktor bilgisi başarıyla getirildi:', {
        doctorId: profile.id,
        doctorName: `${profile.name} ${profile.surname}`,
        specialization: profile.specialization_name
      });

      return profile;
    } catch (error) {
      console.error('💥 Doktor bilgisi getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        doctorId
      });
      return null;
    }
  }

  /**
   * Doktorun hastalarını listele
   */
  async getDoctorPatients(doctorId: string): Promise<DoctorWithPatients['patients']> {
    console.log('👥 Doktor hastaları getiriliyor...', { doctorId });

    try {
      const { data, error } = await supabase
        .from('doctor_patients')
        .select(`
          patients!inner(
            id,
            name,
            surname,
            birth_date,
            patient_note,
            created_at,
            genders(name)
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('is_deleted', false)
        .eq('patients.is_deleted', false);

      if (error) {
        console.error('❌ Doktor hastaları getirme hatası:', {
          error: error.message,
          code: error.code,
          doctorId
        });
        return [];
      }

      const patients = (data || []).map((item: any) => ({
        id: item.patients.id,
        name: item.patients.name,
        surname: item.patients.surname,
        birth_date: item.patients.birth_date,
        gender_name: item.patients.genders?.name || null,
        patient_note: item.patients.patient_note,
        created_at: item.patients.created_at,
      }));

      console.log('✅ Doktor hastaları başarıyla getirildi:', {
        doctorId,
        patientCount: patients.length,
      });

      return patients;
    } catch (error) {
      console.error('💥 Doktor hastaları getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        doctorId
      });
      return [];
    }
  }

  /**
   * Doktor profilini güncelle
   */
  async updateDoctorProfile(
    doctorId: string,
    updates: {
      name?: string;
      surname?: string;
      specialization_id?: number;
    }
  ): Promise<boolean> {
    console.log('✏️ Doktor profili güncelleniyor...', { doctorId, updates });

    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
        .eq('is_deleted', false);

      if (error) {
        console.error('❌ Doktor profili güncelleme hatası:', {
          error: error.message,
          code: error.code,
          doctorId,
          updates
        });
        return false;
      }

      console.log('✅ Doktor profili başarıyla güncellendi:', {
        doctorId,
        updates
      });

      return true;
    } catch (error) {
      console.error('💥 Doktor profili güncelleme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        doctorId,
        updates
      });
      return false;
    }
  }

  /**
   * Uzmanlık alanlarını getir
   */
  async getSpecializations(): Promise<Tables<'specializations'>[]> {
    console.log('🔍 Uzmanlık alanları getiriliyor...');

    try {
      const { data, error } = await supabase
        .from('specializations')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Uzmanlık alanları getirme hatası:', {
          error: error.message,
          code: error.code
        });
        return [];
      }

      console.log('✅ Uzmanlık alanları başarıyla getirildi:', {
        count: data?.length || 0
      });

      return data || [];
    } catch (error) {
      console.error('💥 Uzmanlık alanları getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error
      });
      return [];
    }
  }

  /**
   * Yaş hesaplama utility fonksiyonu
   */
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Cinsiyet formatlama utility fonksiyonu
   */
  formatGender(genderName: string | null): string {
    if (!genderName) return 'Belirtilmemiş';

    const genderMap: { [key: string]: string } = {
      'male': 'Erkek',
      'female': 'Kadın',
      'other': 'Diğer'
    };

    return genderMap[genderName.toLowerCase()] || genderName;
  }

  /**
   * Yeni hasta ekle
   */
  async addPatient(doctorId: string, formData: PatientFormData): Promise<{ success: boolean; error?: string }> {
    console.log('👥 [AddPatient] Hasta ekleme işlemi başlatılıyor...', {
      email: formData.email,
      name: formData.name,
      surname: formData.surname,
      doctorId
    });

    try {
      // Validation
      if (!formData.email.trim()) throw new Error('E-posta adresi gereklidir');
      if (!formData.password.trim()) throw new Error('Şifre gereklidir');
      if (formData.password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır');
      if (!formData.name.trim()) throw new Error('Ad gereklidir');
      if (!formData.surname.trim()) throw new Error('Soyad gereklidir');
      if (!formData.gender) throw new Error('Cinsiyet seçimi gereklidir');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) throw new Error('Geçerli bir e-posta adresi giriniz');

      // Test domain'lerini engelle
      const invalidDomains = ['example.com', 'test.com', 'invalid.com'];
      const emailDomain = formData.email.split('@')[1]?.toLowerCase();
      if (invalidDomains.includes(emailDomain)) {
        throw new Error('Lütfen gerçek bir e-posta adresi kullanın (gmail.com, outlook.com vb.)');
      }

      // 1. Önce hasta için auth kullanıcısı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('💥 [AddPatient] Auth kullanıcı oluşturma hatası:', authError);

        // E-posta validasyon hatası için özel mesaj
        if (authError.message.includes('Email address') && authError.message.includes('invalid')) {
          throw new Error('Geçersiz e-posta adresi. Lütfen gerçek bir e-posta adresi kullanın (gmail.com, outlook.com vb.)');
        }

        throw new Error(`Kullanıcı oluşturulamadı: ${authError.message}`);
      }

      if (!authData.user?.id) {
        throw new Error('Kullanıcı ID\'si alınamadı');
      }

      const patientUserId = authData.user.id;
      console.log('✅ [AddPatient] Auth kullanıcısı oluşturuldu:', { patientUserId });

      // 2. Users tablosuna ekle
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: patientUserId,
          email: formData.email,
          role_id: 3, // Patient role ID
          created_at: new Date().toISOString(),
        });

      if (userError) {
        console.error('💥 [AddPatient] Users tablosuna ekleme hatası:', userError);
        throw new Error(`Kullanıcı kaydı oluşturulamadı: ${userError.message}`);
      }

      console.log('✅ [AddPatient] Users tablosuna kaydedildi');

      // 3. Cinsiyet ID'sini belirle (erkek: 1, kadın: 2)
      const genderId = formData.gender === 'male' ? 1 : 2;
      console.log('✅ [AddPatient] Cinsiyet ID belirlendi:', { gender: formData.gender, genderId });

      // 4. Patients tablosuna ekle
      const patientInsertData = {
        user_id: patientUserId,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        birth_date: formData.birth_date,
        gender_id: genderId,
        patient_note: formData.patient_note.trim() || null,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert(patientInsertData as any)
        .select('id')
        .single();

      if (patientError) {
        console.error('💥 [AddPatient] Patients tablosuna ekleme hatası:', patientError);
        throw new Error(`Hasta kaydı oluşturulamadı: ${patientError.message}`);
      }

      if (!patientData?.id) {
        throw new Error('Hasta ID\'si alınamadı');
      }

      const patientId = patientData.id;
      console.log('✅ [AddPatient] Patients tablosuna kaydedildi:', { patientId });

      // 5. Doctor_patients tablosuna ilişki ekle
      const { error: doctorPatientError } = await supabase
        .from('doctor_patients')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          is_deleted: false,
          created_at: new Date().toISOString(),
        });

      if (doctorPatientError) {
        console.error('💥 [AddPatient] Doctor_patients tablosuna ekleme hatası:', doctorPatientError);
        throw new Error(`Doktor-hasta ilişkisi oluşturulamadı: ${doctorPatientError.message}`);
      }

      console.log('✅ [AddPatient] Doctor_patients tablosuna kaydedildi');

      // 6. Doktorun hasta sayısını güncelle
      const { count } = await supabase
        .from('doctor_patients')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('is_deleted', false);

      await supabase
        .from('doctors')
        .update({
          patient_count: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId);

      console.log('✅ [AddPatient] Doktor hasta sayısı güncellendi:', { newCount: count || 0 });

      return { success: true };

    } catch (error) {
      console.error('💥 [AddPatient] Hasta ekleme beklenmeyen hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hasta eklenirken bir hata oluştu'
      };
    }
  }
}

export const doctorService = new DoctorService();