export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      complaint_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      complaint_subcategories: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_critical: boolean | null;
          name: string;
          priority_level: Database['public']['Enums']['priority_level'] | null;
          symptom_hint: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_critical?: boolean | null;
          name: string;
          priority_level?: Database['public']['Enums']['priority_level'] | null;
          symptom_hint?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_critical?: boolean | null;
          name?: string;
          priority_level?: Database['public']['Enums']['priority_level'] | null;
          symptom_hint?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'complaint_subcategories_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'complaint_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      complaints: {
        Row: {
          created_at: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean | null;
          is_deleted: boolean | null;
          patient_id: string | null;
          start_date: string | null;
          subcategory_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_deleted?: boolean | null;
          patient_id?: string | null;
          start_date?: string | null;
          subcategory_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_deleted?: boolean | null;
          patient_id?: string | null;
          start_date?: string | null;
          subcategory_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'complaints_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'complaints_subcategory_id_fkey';
            columns: ['subcategory_id'];
            isOneToOne: false;
            referencedRelation: 'complaint_subcategories';
            referencedColumns: ['id'];
          },
        ];
      };
      doctor_patients: {
        Row: {
          created_at: string | null;
          doctor_id: string | null;
          id: string;
          is_deleted: boolean | null;
          note: string | null;
          patient_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          doctor_id?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          note?: string | null;
          patient_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          doctor_id?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          note?: string | null;
          patient_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'doctor_patients_doctor_id_fkey';
            columns: ['doctor_id'];
            isOneToOne: false;
            referencedRelation: 'doctors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'doctor_patients_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          },
        ];
      };
      doctors: {
        Row: {
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          name: string | null;
          patient_count: number | null;
          specialization_id: number | null;
          surname: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          name?: string | null;
          patient_count?: number | null;
          specialization_id?: number | null;
          surname?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          name?: string | null;
          patient_count?: number | null;
          specialization_id?: number | null;
          surname?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'doctors_specialization_id_fkey';
            columns: ['specialization_id'];
            isOneToOne: false;
            referencedRelation: 'specializations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'doctors_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      fcm_tokens: {
        Row: {
          created_at: string | null;
          device_info: string | null;
          id: string;
          is_active: boolean | null;
          platform: string | null;
          token: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          device_info?: string | null;
          id?: string;
          is_active?: boolean | null;
          platform?: string | null;
          token: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          device_info?: string | null;
          id?: string;
          is_active?: boolean | null;
          platform?: string | null;
          token?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fcm_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      genders: {
        Row: {
          code: string;
          id: number;
          name: string;
        };
        Insert: {
          code: string;
          id?: number;
          name: string;
        };
        Update: {
          code?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      health_measurements: {
        Row: {
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          measured_at: string | null;
          measurement_type_id: number | null;
          method: string | null;
          patient_id: string | null;
          updated_at: string | null;
          value: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          measured_at?: string | null;
          measurement_type_id?: number | null;
          method?: string | null;
          patient_id?: string | null;
          updated_at?: string | null;
          value?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          measured_at?: string | null;
          measurement_type_id?: number | null;
          method?: string | null;
          patient_id?: string | null;
          updated_at?: string | null;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'health_measurements_measurement_type_id_fkey';
            columns: ['measurement_type_id'];
            isOneToOne: false;
            referencedRelation: 'measurement_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'health_measurements_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          },
        ];
      };
      measurement_types: {
        Row: {
          code: string;
          id: number;
          name: string;
          unit: string;
        };
        Insert: {
          code: string;
          id?: number;
          name: string;
          unit: string;
        };
        Update: {
          code?: string;
          id?: number;
          name?: string;
          unit?: string;
        };
        Relationships: [];
      };
      message_types: {
        Row: {
          code: string;
          id: number;
          name: string;
        };
        Insert: {
          code: string;
          id?: number;
          name: string;
        };
        Update: {
          code?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          is_read: boolean;
          message_type_id: number | null;
          receiver_user_id: string | null;
          sender_user_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          is_read?: boolean;
          message_type_id?: number | null;
          receiver_user_id?: string | null;
          sender_user_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          is_read?: boolean;
          message_type_id?: number | null;
          receiver_user_id?: string | null;
          sender_user_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_message_type_id_fkey';
            columns: ['message_type_id'];
            isOneToOne: false;
            referencedRelation: 'message_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_receiver_user_id_fkey';
            columns: ['receiver_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_user_id_fkey';
            columns: ['sender_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      patients: {
        Row: {
          birth_date: string | null;
          created_at: string | null;
          gender_id: number | null;
          id: string;
          is_deleted: boolean | null;
          name: string | null;
          patient_note: string | null;
          surname: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          birth_date?: string | null;
          created_at?: string | null;
          gender_id?: number | null;
          id?: string;
          is_deleted?: boolean | null;
          name?: string | null;
          patient_note?: string | null;
          surname?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          birth_date?: string | null;
          created_at?: string | null;
          gender_id?: number | null;
          id?: string;
          is_deleted?: boolean | null;
          name?: string | null;
          patient_note?: string | null;
          surname?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patients_gender_id_fkey';
            columns: ['gender_id'];
            isOneToOne: false;
            referencedRelation: 'genders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patients_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      specializations: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          code: string;
          id: number;
          name: string;
        };
        Insert: {
          code: string;
          id?: number;
          name: string;
        };
        Update: {
          code?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          is_deleted: boolean | null;
          role_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          is_deleted?: boolean | null;
          role_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          is_deleted?: boolean | null;
          role_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'user_roles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      complaint_status: 'pending' | 'reviewed' | 'closed';
      exercise_difficulty: 'easy' | 'medium' | 'hard';
      gender_type: 'male' | 'female' | 'other';
      notification_type: 'info' | 'alert' | 'reminder';
      priority_level: 'low' | 'medium' | 'high';
      user_role: 'patient' | 'doctor' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;