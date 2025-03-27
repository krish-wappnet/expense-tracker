// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import SignUp from '@/components/auth/SignUp.vue';
import Login from '@/components/auth/Login.vue';
import Profile from '@/components/auth/Profile.vue'; // Add this
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  // {
  //   path: '/profile',
  //   name: 'Profile',
  //   component: Profile,
  //   meta: { requiresAuth: true },
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'SignUp') && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;