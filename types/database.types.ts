export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          date_of_birth: string
          email: string
          phone: string | null
          address: string | null
          medical_history: Json | null
          user_id: string
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          date_of_birth: string
          email: string
          phone?: string | null
          address?: string | null
          medical_history?: Json | null
          user_id: string
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          email?: string
          phone?: string | null
          address?: string | null
          medical_history?: Json | null
          user_id?: string
          created_by?: string | null
        }
      }
      scans: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          image_url: string
          thumbnail_url: string | null
          scan_type: Database['public']['Enums']['scan_type']
          scan_date: string
          notes: string | null
          doctor_id: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          image_url: string
          thumbnail_url?: string | null
          scan_type: Database['public']['Enums']['scan_type']
          scan_date: string
          notes?: string | null
          doctor_id: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          image_url?: string
          thumbnail_url?: string | null
          scan_type?: Database['public']['Enums']['scan_type']
          scan_date?: string
          notes?: string | null
          doctor_id?: string
          metadata?: Json | null
        }
      }
      diagnoses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          scan_id: string
          diagnosis: string
          confidence: number
          diagnosis_date: string
          doctor_id: string | null
          ai_generated: boolean
          verified: boolean
          verification_date: string | null
          verification_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          scan_id: string
          diagnosis: string
          confidence: number
          diagnosis_date: string
          doctor_id?: string | null
          ai_generated: boolean
          verified: boolean
          verification_date?: string | null
          verification_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          scan_id?: string
          diagnosis?: string
          confidence?: number
          diagnosis_date?: string
          doctor_id?: string | null
          ai_generated?: boolean
          verified?: boolean
          verification_date?: string | null
          verification_notes?: string | null
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: Database['public']['Enums']['user_role']
          first_name: string
          last_name: string
          avatar_url: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          role: Database['public']['Enums']['user_role']
          first_name: string
          last_name: string
          avatar_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          is_active?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      scan_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          user_id: string
          description: string
          symptoms: string | null
          medical_history: string | null
          status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assigned_doctor_id: string | null
          completed_at: string | null
          has_image: boolean
          scan_id: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          user_id: string
          description: string
          symptoms?: string | null
          medical_history?: string | null
          status?: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_doctor_id?: string | null
          completed_at?: string | null
          has_image?: boolean
          scan_id?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          user_id?: string
          description?: string
          symptoms?: string | null
          medical_history?: string | null
          status?: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_doctor_id?: string | null
          completed_at?: string | null
          has_image?: boolean
          scan_id?: string | null
          image_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'doctor' | 'patient'
      scan_type: 'fundus' | 'oct' | 'visual_field' | 'corneal_topography' | 'other'
    }
  }
}