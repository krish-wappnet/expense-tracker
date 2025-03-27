// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { signUp, login, logout as logoutService } from '@/services/authService';

interface User {
  id: number;
  email: string;
  profilePicture?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: ref<User | null>(null),
    token: ref<string | null>(null),
  }),

  getters: {
    getToken: (state) => state.token,
    isAuthenticated: (state) => !!state.currentUser && !!state.token, // Add isAuthenticated getter
  },

  actions: {
    async signUp(email: string, password: string) {
      const response = await signUp({ email, password });
      return response;
    },

    async login(email: string, password: string) {
      const { token, user } = await login({ email, password });
      this.currentUser = user;
      this.token = token;
    },

    logout() {
      this.currentUser = null;
      this.token = null;
      logoutService();
    },
  },
});