import axios from 'axios';
import { API_URL } from '@/config';

export interface CompanyProfile {
  id: number;
  name: string;
  logo: string;
  description: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export const fetchCompanyProfile = async (): Promise<CompanyProfile> => {
  try {
    const response = await axios.get(`${API_URL}/company-profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
};

export const updateCompanyProfile = async (profile: Partial<CompanyProfile>): Promise<CompanyProfile> => {
  try {
    const response = await axios.put(`${API_URL}/company-profile`, profile);
    return response.data;
  } catch (error) {
    console.error('Error updating company profile:', error);
    throw error;
  }
};
