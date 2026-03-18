// ─────────────────────────────────────────────────────────────────────────────
// FlowRoll SaaS API Types
// ─────────────────────────────────────────────────────────────────────────────

// Auth
export interface TokenPair {
  access: string;
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenObtainRequest {
  username: string;
  password: string;
}

// User
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Academy (tenant root)
export interface Academy {
  id: number;
  name: string;
  city?: string;
  created_at: string;
}

export interface AcademyRequest {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Belt
export type BeltColor = 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK';

export interface Belt {
  id: number;
  color: BeltColor;
  stripes: number; // 0-4
}

// Athlete
export interface AthleteProfile {
  id: number;
  user: User;
  academy: number;
  belt: Belt;
  weight_class?: string;
  date_of_birth?: string;
  phone?: string;
  active_subscription?: Subscription | null;
  created_at: string;
}

export interface AthleteProfileRequest {
  user_id: number;
  belt_color?: BeltColor;
  belt_stripes?: number;
  weight_class?: string;
  date_of_birth?: string;
  phone?: string;
}

// Training Class
export type ClassType = 'GI' | 'NOGI' | 'KIDS' | 'COMPETITION' | 'OPEN_MAT';

export interface TrainingClass {
  id: number;
  academy: number;
  title: string;
  class_type: ClassType;
  professor: number;
  professor_username: string;
  scheduled_at: string;
  duration_minutes: number;
  max_capacity: number;
  attendance_count: number;
  notes?: string;
  created_at: string;
}

export interface TrainingClassRequest {
  title: string;
  class_type: ClassType;
  professor_id: number;
  scheduled_at: string;
  duration_minutes: number;
  max_capacity: number;
  notes?: string;
}

// Check-In
export interface CheckIn {
  id: number;
  athlete: AthleteProfile;
  training_class: number;
  timestamp: string;
  method: 'QR' | 'MANUAL';
}

export interface CheckInRequest {
  athlete_id: number;
  training_class_id: number;
  method?: 'QR' | 'MANUAL';
}

export interface QRCheckInRequest {
  qr_token: string;
  training_class_id: number;
}

// Match
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED';

export interface MatchScore {
  points: number;
  advantages: number;
  penalties: number;
}

export interface Match {
  id: number;
  academy: number;
  athlete_a: AthleteProfile;
  athlete_b: AthleteProfile;
  score_a: MatchScore;
  score_b: MatchScore;
  winner?: 'A' | 'B' | 'DRAW' | null;
  status: MatchStatus;
  tatami_session?: number | null;
  created_at: string;
  finished_at?: string | null;
}

export interface MatchRequest {
  athlete_a_id: number;
  athlete_b_id: number;
}

export interface MatchScoreUpdateRequest {
  side: 'A' | 'B';
  action: 'POINTS' | 'ADVANTAGE' | 'PENALTY';
  delta: number; // +1 or -1
}

// Timer / Tatami
export type TimerSessionStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';

export interface TimerPreset {
  id: number;
  academy: number;
  name: string;
  rounds: number;
  work_seconds: number;
  rest_seconds: number;
}

export interface TimerPresetRequest {
  name: string;
  rounds: number;
  work_seconds: number;
  rest_seconds: number;
}

export interface TimerSession {
  id: number;
  academy: number;
  preset: TimerPreset;
  status: TimerSessionStatus;
  current_round: number;
  elapsed_seconds: number;
  started_at?: string | null;
  finished_at?: string | null;
}

// Membership
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export interface MembershipPlan {
  id: number;
  academy: number;
  name: string;
  description?: string;
  price: string; // decimal as string
  billing_period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  max_classes_per_week?: number | null;
}

export interface Subscription {
  id: number;
  athlete: number;
  plan: MembershipPlan;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
}

export interface SubscriptionRequest {
  athlete_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  auto_renew?: boolean;
}

// Promotion
export interface Promotion {
  id: number;
  athlete: AthleteProfile;
  from_belt: Belt;
  to_belt: Belt;
  promoted_at: string;
  promoted_by: AthleteProfile;
  ceremony_notes?: string;
}

export interface PromotionRequest {
  athlete_id: number;
  to_belt_color: BeltColor;
  to_belt_stripes: number;
  ceremony_notes?: string;
}

// Seminars
export interface Seminar {
  id: number;
  academy: number;
  title: string;
  description?: string;
  instructor: string;
  date: string;
  price: string;
  capacity: number;
  registered_count: number;
}

// Techniques (platform library)
export interface Technique {
  id: number;
  name: string;
  description?: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  min_belt?: BeltColor;
  video_url?: string;
  tags: string[];
}

// Learning (athlete diary)
export interface TechniqueNote {
  id: number;
  athlete: number;
  technique: Technique;
  note: string;
  drilled_at: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface SparringNote {
  id: number;
  athlete: number;
  partner?: AthleteProfile | null;
  notes: string;
  date: string;
  training_class?: number | null;
}

// Community
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'ATTENDANCE' | 'COMPETITION' | 'PROMOTION' | 'LEARNING' | 'COMMUNITY';
}

export interface AthleteAchievement {
  id: number;
  athlete: number;
  achievement: Achievement;
  earned_at: string;
}

export interface OpenMatSession {
  id: number;
  academy: number;
  host: AthleteProfile;
  title: string;
  scheduled_at: string;
  max_participants: number;
  participant_count: number;
  notes?: string;
  is_public: boolean;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API error shape from DRF
export interface ApiError {
  detail?: string;
  [field: string]: string | string[] | undefined;
}
