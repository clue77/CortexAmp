export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
  user_id: string;
  display_name: string | null;
  skill_level: SkillLevel;
  timezone: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  track_id: string;
  difficulty: Difficulty;
  title: string;
  scenario: string;
  instructions: string;
  success_criteria: string | null;
  day_date: string;
  is_published: boolean;
  canonical_goal: string;
  challenge_fingerprint: string;
  generated_by_ai: boolean;
  reviewed_by_human: boolean;
  created_at: string;
  track?: Track;
}

export interface ChallengeSubmission {
  id: string;
  user_id: string;
  challenge_id: string;
  submission_text: string;
  submitted_at: string;
  created_at: string;
  challenge?: Challenge;
}

export interface AIFeedback {
  id: string;
  submission_id: string;
  score: number;
  strengths: string[];
  improvements: string[];
  suggested_revision: string;
  next_challenge_tip: string;
  model: string;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  challenges_completed: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  avg_score: number;
  updated_at: string;
}
