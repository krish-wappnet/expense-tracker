// src/services/authService.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3000/auth'; // Matches your backend URL

interface SignUpData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignUpResponse {
  message: string; // e.g., "Signup successful. Now you can login."
}

interface LoginResponse {
  token: string;
}

interface User {
  id: number; // Changed from string to number to match backend User entity
  email: string;
  profilePicture?: string;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signUp = async (data: SignUpData): Promise<SignUpResponse> => {
  try {
    const response = await axiosInstance.post('/signup', data);
    return response.data;
  } catch (error: any) {
    console.error('Sign-up error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to sign up');
  }
};

export const login = async (data: LoginData): Promise<LoginResponse & { user: User }> => {
  try {
    const response = await axiosInstance.post('/login', data);
    const token = response.data.token;
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const user: User = {
      id: Number(payload.id), // Ensure id is a number
      email: payload.email,
    };
    return { token, user };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};

export const getCurrentUser = (): User | null => {
  const authStore = useAuthStore();
  return authStore.currentUser;
};

export const getToken = (): string | null => {
  const authStore = useAuthStore();
  return authStore.getToken;
};

export const logout = (): void => {
  const authStore = useAuthStore();
  authStore.logout(); // Fixed to match the method in authStore.ts
};

export const validateToken = async (): Promise<User> => {
    const response = await axiosInstance.get('/me');
    return response.data;
};