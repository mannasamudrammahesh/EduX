export enum UserRole {
  STUDENT = 'STUDENT',
  EDUCATOR = 'EDUCATOR'
}

export type Visibility = 'Public' | 'Private' | 'Unlisted';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: Visibility;
  thumbnailUrl: string;
  status: 'Live' | 'Processing' | 'Draft';
  uploadDate: string;
  duration: string;
  fileSize: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  file: File | null;
  thumbnail: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  points: number;
  coursesCompleted: number;
  badges: string[];
  phone?: string; 
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  locked: boolean;
  price: number; 
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  isAnonymous?: boolean;  
  image?: string;         
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  isPublic: boolean;
  url: string;
  date: string;
}

export enum View {
  DASHBOARD = 'Dashboard',
  COURSES = 'Courses',
  REWARDS = 'Spin Rewards',
  COMMUNITY = 'Community',
  BOT = 'EduxBot',
  CREATOR = 'Creator Studio',
  NOTES = 'Notes',
  CERTIFICATES = 'Certificates',
  LEADERBOARD = 'Leaderboard',
  SETTINGS = 'Settings'
}