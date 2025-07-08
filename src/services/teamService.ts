import axios from 'axios';
import { API_URL } from '@/config';

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  image: string;
  department: string;
}

export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const response = await axios.get(`${API_URL}/team-members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const addTeamMember = async (teamMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    const response = await axios.post(`${API_URL}/team-members`, teamMember);
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: number, teamMember: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    const response = await axios.put(`${API_URL}/team-members/${id}`, teamMember);
    return response.data;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/team-members/${id}`);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};
