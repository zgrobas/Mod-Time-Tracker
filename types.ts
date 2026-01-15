
export enum View {
  DASHBOARD = 'DASHBOARD',
  PROJECT_LIST = 'PROJECT_LIST',
  REPORTS = 'REPORTS'
}

export interface User {
  id: string;
  username: string;
  avatarSeed: string;
  lastLogin: string;
}

export interface Project {
  id: string;
  userId: string; // Relación con el usuario
  name: string;
  category: string;
  description?: string;
  color: string;
  lastTracked: string;
  usageLevel: number;
  totalHours: string;
  status: 'Active' | 'On Hold' | 'Running';
  department: string;
  currentDaySeconds: number;
}

export interface DailyLog {
  id: string;
  userId: string; // Relación con el usuario
  date: string;
  projectId: string;
  projectName: string;
  durationSeconds: number;
  status: 'Billable' | 'Non-billable';
}

export interface ActivityLog {
  id: string;
  projectName: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'Billable' | 'Non-billable';
  color: string;
}
