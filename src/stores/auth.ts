// src/stores/auth.ts
import { defineStore } from 'pinia';
import { auth, db } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  profilePicture?: string | null;
  displayName?: string | null;
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
    async saveUserData(user: any) {
      try {
        console.log('Saving user data for:', user.uid, user.email);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        const userData: User = {
          id: user.uid,
          email: user.email || '',
          profilePicture: user.photoURL || null,
          displayName: user.displayName || null,
        };

        if (!userSnap.exists()) {
          console.log('Creating new user document with data:', userData);
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        } else {
          console.log('Updating existing user document');
          await setDoc(userRef, {
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        }
        console.log('User data saved successfully');
        return userData;
      } catch (error: any) {
        console.error('Detailed error saving user data:', {
          code: error.code,
          message: error.message,
          stack: error.stack,
          user: { uid: user?.uid, email: user?.email }
        });
        throw new Error('Failed to save user data: ' + (error.message || 'Unknown error'));
      }
    },

    async initializeAuth() {
      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken();
            const userData = await this.saveUserData(firebaseUser);
            this.currentUser = userData;
            this.token = idToken;
            localStorage.setItem('token', idToken);
          } else {
            this.currentUser = null;
            this.token = null;
            localStorage.removeItem('token');
          }
          resolve();
        });
      });
    },

    async signUp(email: string, password: string, displayName: string) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName });

        const idToken = await firebaseUser.getIdToken();
        const userData = await this.saveUserData(firebaseUser);

        this.currentUser = userData;
        this.token = idToken;
        localStorage.setItem('token', idToken);
      } catch (error: any) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }
    },

    async login(email: string, password: string) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const idToken = await firebaseUser.getIdToken();
        const userData = await this.saveUserData(firebaseUser);
        this.currentUser = userData;
        this.token = idToken;
        localStorage.setItem('token', idToken);
      } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed');
      }
    },

    async loginWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();
        const userData = await this.saveUserData(firebaseUser);
        this.currentUser = userData;
        this.token = idToken;
        localStorage.setItem('token', idToken);
        return { success: true };
      } catch (error: any) {
        console.error('Google login error:', error);
        throw new Error(error.message || 'Google login failed');
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('token');
      } catch (error: any) {
        console.error('Logout error:', error);
        throw new Error(error.message || 'Logout failed');
      }
    },
  },
});