import axios from 'axios';
import { API_URL } from '@/config';

export interface DashboardMetrics {
  activeLoans: number;
  availableCredit: number;
  pendingApplications: number;
  documents: number;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

export const fetchRecentActivities = async (): Promise<Activity[]> => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/activities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};
