// src/stores/auth.ts
import { defineStore } from 'pinia';
import { signUp, login, logout as logoutService } from '@/services/authService';
import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface User {
  id: number;
  email: string;
  profilePicture?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    token: null as string | null,
  }),

  getters: {
    getToken: (state) => state.token,
    isAuthenticated: (state) => !!state.currentUser && !!state.token,
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
      localStorage.setItem('token', token); // Persist token
    },

    async loginWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Option 1: Use Firebase token directly (client-side only)
        this.token = idToken;
        this.currentUser = {
          id: Number(user.uid), // Firebase UID as number (adjust if needed)
          email: user.email || '',
          profilePicture: user.photoURL || undefined,
        };
        localStorage.setItem('token', idToken);

        // Option 2: Send token to backend for verification (uncomment if applicable)
        /*
        const response = await fetch('http://your-api-endpoint/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ idToken }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Google login failed');
        this.token = data.token; // Use backend-provided token
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          profilePicture: data.user.profilePicture,
        };
        localStorage.setItem('token', data.token);
        */

        return { success: true };
      } catch (error: any) {
        console.error('Google login error:', error);
        throw new Error(error.message || 'Google login failed');
      }
    },

    logout() {
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('token');
      logoutService(); // Call existing logout service
      auth.signOut(); // Sign out from Firebase
    },
  },
});