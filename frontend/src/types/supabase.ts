
// Export types for use across the application
export type UserRole = 'citizen' | 'official' | 'admin' | 'super-admin';
export type SupportedLanguage = 'english' | 'hindi' | 'spanish';
export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_language: SupportedLanguage;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  predicted_category: string | null;
  confidence_score: number | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  predicted_priority: ComplaintPriority | null;
  citizen_id: string;
  phone_number: string; 
  assigned_to_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_url: string;
  ai_detected_issue: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  complaint_id: string;
  rating: number;
  comment: string | null;
  sentiment_score: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any | null;
  new_data: any | null;
  created_at: string;
}
