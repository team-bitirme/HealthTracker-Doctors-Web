import { supabase } from '@/lib/supabase';
import { Patient } from '@/components/dashboard/Dashboard';

export interface PatientReportData {
  patient: Patient;
  healthMeasurements: HealthMeasurement[];
  complaints: Complaint[];
  exercisePlans: ExercisePlan[];
  recentMessages: Message[];
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

interface ExercisePlan {
  id: string;
  name: string;
  description?: string;
  difficulty_level: string;
  created_at: string;
  exercises?: {
    name: string;
    description?: string;
    target_muscles?: string;
  }[];
}

interface Message {
  id: string;
  content: string;
  sender_user_id: string;
  receiver_user_id: string;
  created_at: string;
}

export class PatientReportService {

  /**
   * Hasta için tüm verileri toplar
   */
  static async gatherPatientData(patient: Patient): Promise<PatientReportData> {
    try {
      // Her veriyi ayrı ayrı al, hata durumunda boş array döndür
      const [healthMeasurements, complaints, exercisePlans, recentMessages] = await Promise.allSettled([
        this.getHealthMeasurements(patient.id),
        this.getComplaints(patient.id),
        this.getExercisePlans(patient.id),
        this.getRecentMessages(patient.id)
      ]);

      return {
        patient,
        healthMeasurements: healthMeasurements.status === 'fulfilled' ? healthMeasurements.value : [],
        complaints: complaints.status === 'fulfilled' ? complaints.value : [],
        exercisePlans: exercisePlans.status === 'fulfilled' ? exercisePlans.value : [],
        recentMessages: recentMessages.status === 'fulfilled' ? recentMessages.value : []
      };
    } catch (error) {
      console.error('Hasta verileri toplanırken kritik hata:', error);

      // En kötü durumda bile hasta bilgisiyle devam et
      return {
        patient,
        healthMeasurements: [],
        complaints: [],
        exercisePlans: [],
        recentMessages: []
      };
    }
  }

  /**
   * Sağlık ölçümlerini getirir
   */
  private static async getHealthMeasurements(patientId: string): Promise<HealthMeasurement[]> {
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
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn('Sağlık ölçümleri alınırken hata (devam ediliyor):', error);
        return [];
      }

      return (data || []).map(measurement => ({
        ...measurement,
        measurement_type: Array.isArray(measurement.measurement_types)
          ? measurement.measurement_types[0]
          : measurement.measurement_types
      }));
    } catch (error) {
      console.warn('Sağlık ölçümleri alınırken beklenmeyen hata:', error);
      return [];
    }
  }

  /**
   * Şikayetleri getirir
   */
  private static async getComplaints(patientId: string): Promise<Complaint[]> {
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
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Şikayetler alınırken hata (devam ediliyor):', error);
        return [];
      }

      return (data || []).map(complaint => ({
        ...complaint,
        subcategory: Array.isArray(complaint.complaint_subcategories)
          ? complaint.complaint_subcategories[0]
          : complaint.complaint_subcategories
      }));
    } catch (error) {
      console.warn('Şikayetler alınırken beklenmeyen hata:', error);
      return [];
    }
  }

  /**
   * Egzersiz planlarını getirir
   */
  private static async getExercisePlans(patientId: string): Promise<ExercisePlan[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('Egzersiz planları alınırken hata (devam ediliyor):', error);
        return [];
      }

      return (data || []).map(plan => ({
        ...plan,
        exercises: [] // Egzersiz detayları şimdilik boş, tablo yapısı net olmadığı için
      }));
    } catch (error) {
      console.warn('Egzersiz planları alınırken beklenmeyen hata:', error);
      return [];
    }
  }

  /**
   * Son mesajları getirir
   */
  private static async getRecentMessages(patientId: string): Promise<Message[]> {
    try {
      // Önce hasta user_id'sini al
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', patientId)
        .single();

      if (patientError) {
        console.warn('Hasta user_id alınırken hata (devam ediliyor):', patientError);
        return [];
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_user_id.eq.${patientData.user_id},receiver_user_id.eq.${patientData.user_id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Mesajlar alınırken hata (devam ediliyor):', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Mesajlar alınırken beklenmeyen hata:', error);
      return [];
    }
  }

  /**
   * Hasta verilerinden LLM için prompt oluşturur
   */
  static generatePatientReportPrompt(data: PatientReportData): string {
    const { patient, healthMeasurements, complaints, exercisePlans, recentMessages } = data;

    let prompt = `Aşağıdaki hasta için detaylı bir tıbbi değerlendirme raporu hazırla:\n\n`;

    // Hasta bilgileri
    prompt += `## HASTA BİLGİLERİ\n`;
    prompt += `Ad Soyad: ${patient.name} ${patient.surname}\n`;
    prompt += `Yaş: ${patient.age}\n`;
    if (patient.diagnosis) {
      prompt += `Teşhis: ${patient.diagnosis}\n`;
    }
    prompt += `\n`;

    // Sağlık ölçümleri
    if (healthMeasurements.length > 0) {
      prompt += `## SAĞLIK ÖLÇÜMLERİ\n`;
      healthMeasurements.forEach(measurement => {
        const date = new Date(measurement.measured_at).toLocaleDateString('tr-TR');
        prompt += `- ${measurement.measurement_type?.name || 'Bilinmeyen'}: ${measurement.value} ${measurement.measurement_type?.unit || ''} (${date})\n`;
      });
      prompt += `\n`;
    } else {
      prompt += `## SAĞLIK ÖLÇÜMLERİ\n`;
      prompt += `Henüz sağlık ölçümü bulunmuyor.\n\n`;
    }

    // Aktif şikayetler
    const activeComplaints = complaints.filter(c => c.is_active);
    if (activeComplaints.length > 0) {
      prompt += `## AKTİF ŞİKAYETLER\n`;
      activeComplaints.forEach(complaint => {
        const startDate = new Date(complaint.start_date).toLocaleDateString('tr-TR');
        const priority = complaint.subcategory?.priority_level || 'belirsiz';
        prompt += `- ${complaint.subcategory?.name || 'Genel'} (${priority} öncelik): ${complaint.description} (Başlangıç: ${startDate})\n`;
      });
      prompt += `\n`;
    } else {
      prompt += `## AKTİF ŞİKAYETLER\n`;
      prompt += `Şu anda aktif şikayet bulunmuyor.\n\n`;
    }

    // Geçmiş şikayetler
    const resolvedComplaints = complaints.filter(c => !c.is_active);
    if (resolvedComplaints.length > 0) {
      prompt += `## GEÇMİŞ ŞİKAYETLER\n`;
      resolvedComplaints.slice(0, 5).forEach(complaint => {
        const startDate = new Date(complaint.start_date).toLocaleDateString('tr-TR');
        const endDate = complaint.end_date ? new Date(complaint.end_date).toLocaleDateString('tr-TR') : '';
        prompt += `- ${complaint.subcategory?.name || 'Genel'}: ${complaint.description} (${startDate}${endDate ? ` - ${endDate}` : ''})\n`;
      });
      prompt += `\n`;
    }

    // Egzersiz planları
    if (exercisePlans.length > 0) {
      prompt += `## EGZERSİZ PLANLARI\n`;
      exercisePlans.forEach(plan => {
        const date = new Date(plan.created_at).toLocaleDateString('tr-TR');
        prompt += `- ${plan.name || 'İsimsiz Plan'} (${plan.difficulty_level || 'belirtilmemiş'} seviye, ${date})\n`;
        if (plan.description) {
          prompt += `  Açıklama: ${plan.description}\n`;
        }
        if (plan.exercises && plan.exercises.length > 0) {
          prompt += `  Egzersizler: ${plan.exercises.map(e => e.name).join(', ')}\n`;
        }
      });
      prompt += `\n`;
    } else {
      prompt += `## EGZERSİZ PLANLARI\n`;
      prompt += `Henüz egzersiz planı bulunmuyor.\n\n`;
    }

    // Son iletişim
    if (recentMessages.length > 0) {
      prompt += `## SON İLETİŞİM\n`;
      prompt += `Son ${recentMessages.length} mesaj kaydı mevcut.\n`;
      const lastMessageDate = new Date(recentMessages[0].created_at).toLocaleDateString('tr-TR');
      prompt += `Son mesaj tarihi: ${lastMessageDate}\n\n`;
    } else {
      prompt += `## SON İLETİŞİM\n`;
      prompt += `Henüz hasta ile mesaj geçmişi bulunmuyor.\n\n`;
    }

    // Rapor talebi
    prompt += `## RAPOR TALEBİ\n`;
    prompt += `Bu hasta için aşağıdaki konuları içeren kapsamlı bir tıbbi değerlendirme raporu hazırla:\n`;
    prompt += `1. Genel sağlık durumu değerlendirmesi\n`;
    prompt += `2. Sağlık ölçümlerinin analizi ve trend değerlendirmesi\n`;
    prompt += `3. Aktif şikayetlerin öncelik sıralaması ve öneriler\n`;
    prompt += `4. Egzersiz planlarının etkinlik değerlendirmesi\n`;
    prompt += `5. Takip önerileri ve gelecek adımlar\n`;
    prompt += `6. Dikkat edilmesi gereken riskler ve uyarılar\n\n`;
    prompt += `Lütfen profesyonel, detaylı ve doktor için faydalı bir rapor hazırla. Kesin tanı koymaktan kaçın, sadece mevcut verilere dayalı değerlendirme ve önerilerde bulun.`;

    return prompt;
  }
}