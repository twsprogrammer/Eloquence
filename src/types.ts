export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type FeatureKey = 
  | 'smart-translate' 
  | 'fix-improve' 
  | 'word-insight' 
  | 'quick-reply' 
  | 'slang-decoder' 
  | 'level-simplifier';

export interface Feature {
  id: FeatureKey;
  title: string;
  description: string;
  icon: string;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  feature_type: FeatureKey | 'synonym-finder';
  query_text: string;
  result_text: string;
  created_at: string;
}
