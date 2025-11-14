import { Company, User } from './auth.models';

export interface UserRole {
  id: number;
  name: string;
  description: string;
  isSystemRole: boolean;
  accentColor: string;
}

export type TrendDirection = 'up' | 'down' | 'steady';

export interface UserInsight {
  id: string;
  label: string;
  value: string;
  trend: TrendDirection;
  delta: number;
}

export type TimelineTone = 'success' | 'info' | 'warning';

export interface UserTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  tone: TimelineTone;
}

export interface UserProfile extends User {
  fullName: string;
  headline: string;
  location: string;
  timezone: string;
  heroTagline: string;
  playbookStage: string;
  avatarAccent: string;
  lastLoginAt: string;
  createdAt: string;
  roles: UserRole[];
  companies: Company[];
  insights: UserInsight[];
  timeline: UserTimelineEvent[];
  badges: string[];
  favoriteActions: string[];
}

export interface UserUpsertPayload {
  firstName: string;
  lastName: string;
  userName: string;
  isActive: boolean;
  roleIds: number[];
  companyIds: number[];
}
