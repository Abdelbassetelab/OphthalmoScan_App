export interface ScanRequest {
  id: string;
  patient_id: string;
  created_at: string;
  status: 'pending' | 'rejected' | 'completed';
  description: string;
  symptoms: string;
  medical_history: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
