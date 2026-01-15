
import { Project, ActivityLog } from './types';

export const MOCK_PROJECTS: Project[] = [
  // Added userId to satisfy the Project interface
  { id: '1', userId: 'mock-user-1', name: 'Phoenix Rebrand', category: 'Design Systems', color: 'vibrant-red', lastTracked: '2 hours ago', usageLevel: 85, totalHours: '142h', status: 'Running', department: 'MARKETING', currentDaySeconds: 0 },
  { id: '2', userId: 'mock-user-1', name: 'Internal Audit', category: 'Finance & Legal', color: 'vibrant-blue', lastTracked: 'Yesterday', usageLevel: 45, totalHours: '45h', status: 'Active', department: 'FINANCE', currentDaySeconds: 0 },
  { id: '3', userId: 'mock-user-1', name: 'Market Strategy', category: 'Q4 Social Strategy', color: 'vibrant-green', lastTracked: '3 days ago', usageLevel: 100, totalHours: '288h', status: 'Active', department: 'MARKETING', currentDaySeconds: 0 },
  { id: '4', userId: 'mock-user-1', name: 'API Layer', category: 'Stripe & PayPal Connect', color: 'vibrant-orange', lastTracked: 'Last week', usageLevel: 15, totalHours: '12h', status: 'On Hold', department: 'DEVELOPMENT', currentDaySeconds: 0 },
  { id: '5', userId: 'mock-user-1', name: 'Mobile UI Kit', category: 'Product Design', color: 'vibrant-purple', lastTracked: 'Today', usageLevel: 60, totalHours: '89h', status: 'Active', department: 'DEVELOPMENT', currentDaySeconds: 0 },
  { id: '6', userId: 'mock-user-1', name: 'Style Guide', category: 'Business Strategy', color: 'vibrant-pink', lastTracked: 'Yesterday', usageLevel: 30, totalHours: '21h', status: 'Active', department: 'STRATEGY', currentDaySeconds: 0 },
  { id: '7', userId: 'mock-user-1', name: 'Client Portal', category: 'Support', color: 'vibrant-cyan', lastTracked: '4 days ago', usageLevel: 75, totalHours: '66h', status: 'Active', department: 'SUPPORT', currentDaySeconds: 0 },
  { id: '8', userId: 'mock-user-1', name: 'Admin Core', category: 'Operations', color: 'vibrant-yellow', lastTracked: 'Today', usageLevel: 90, totalHours: '110h', status: 'Active', department: 'OPERATIONS', currentDaySeconds: 0 },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: '1', projectName: 'Mobile App Redesign', startTime: '09:15 AM', endTime: '01:30 PM', duration: '4h 15m', status: 'Billable', color: 'vibrant-blue' },
  { id: '2', projectName: 'Admin Panel Updates', startTime: '02:00 PM', endTime: '04:05 PM', duration: '2h 05m', status: 'Billable', color: 'vibrant-purple' },
  { id: '3', projectName: 'Internal Sync Meeting', startTime: '04:15 PM', endTime: '05:15 PM', duration: '1h 00m', status: 'Non-billable', color: 'vibrant-lime' },
];