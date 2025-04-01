import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import { defineComponent } from 'vue';
import Login from '../../components/auth/Login.vue'; // Adjust path as needed
import { useAuthStore } from '@/stores/auth';
import { mockPush } from '../../test/setup.ts'; // Adjust path

const messages = {
  en: {
    login: 'Login',
    email: 'Email',
    password: 'Password',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 6 characters',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    'Sign in with Google': 'Sign in with Google',
    googleSignInFailed: 'Google sign-in failed',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up',
    close: 'Close',
  },
};

interface AuthStore {
  login: ReturnType<typeof vi.fn>;
  loginWithGoogle: ReturnType<typeof vi.fn>;
}

interface LoginInstance {
  loading: boolean;
  snackbar: { show: boolean; message: string; color: string };
  form: { email: string; password: string };
  errors: { email: string; password: string };
  $nextTick: () => Promise<void>;
}

const DummyComponent = defineComponent({ render: () => null });

describe('Login.vue', () => {
  let wrapper: VueWrapper<LoginInstance>;
  let vuetify: ReturnType<typeof createVuetify>;
  let pinia: ReturnType<typeof createPinia>;
  let i18n: ReturnType<typeof createI18n>;
  let router: ReturnType<typeof createRouter>;
  let authStore: AuthStore;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vuetify = createVuetify({ components, directives });
    pinia = createPinia();
    setActivePinia(pinia);
    authStore = useAuthStore() as unknown as AuthStore;
    authStore.login = vi.fn();
    authStore.loginWithGoogle = vi.fn();

    i18n = createI18n({ legacy: false, locale: 'en', messages });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/signup', name: 'signup', component: DummyComponent },
        { path: '/dashboard', name: 'dashboard', component: DummyComponent },
        { path: '/', name: 'root', component: DummyComponent },
      ],
    });
    router.push('/');

    wrapper = mount(Login, {
      global: {
        plugins: [vuetify, pinia, i18n, router],
      },
    }) as VueWrapper<LoginInstance>;

    mockPush.mockClear();
  });

  it('renders the login form correctly', () => {
    expect(wrapper.find('.login-container').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Login');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
    expect(wrapper.find('.google-btn').text()).toContain('Sign in with Google');
  });

  it('shows validation errors when submitting empty form', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.errors.email).toBe('Email is required');
    expect(wrapper.vm.errors.password).toBe('Password is required');
  });

  it('disables buttons when loading', async () => {
    const loginButton = wrapper.find('button[type="submit"]');
    const googleButton = wrapper.find('.google-btn');
    expect((loginButton.element as HTMLButtonElement).disabled).toBe(false);
    expect((googleButton.element as HTMLButtonElement).disabled).toBe(false);

    wrapper.vm.loading = true;
    await wrapper.vm.$nextTick();
    expect((loginButton.element as HTMLButtonElement).disabled).toBe(true);
    expect((googleButton.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows an error when email is invalid', async () => {
    wrapper.vm.form.email = 'invalid-email';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.errors.email).toBe('Email is invalid');
  });

  it('calls login API when form is valid', async () => {
    authStore.login.mockResolvedValueOnce(undefined);
    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.password = 'password123';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(authStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays success message on successful login', async () => {
    authStore.login.mockResolvedValueOnce(undefined);
    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.password = 'password123';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.snackbar.show).toBe(true);
    expect(wrapper.vm.snackbar.message).toBe('Login successful');
    expect(wrapper.vm.snackbar.color).toBe('success');
  });

  it('displays error message on login failure', async () => {
    authStore.login.mockRejectedValueOnce({ message: 'Invalid credentials' });
    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.password = 'wrongpassword';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.snackbar.show).toBe(true);
    expect(wrapper.vm.snackbar.message).toBe('Invalid credentials');
    expect(wrapper.vm.snackbar.color).toBe('error');
  });

  it('calls Google Sign-In when button is clicked', async () => {
    authStore.loginWithGoogle.mockResolvedValueOnce(undefined);
    await wrapper.find('.google-btn').trigger('click');
    await wrapper.vm.$nextTick();
    expect(authStore.loginWithGoogle).toHaveBeenCalled();
  });

  it('displays success message on successful Google Sign-In', async () => {
    authStore.loginWithGoogle.mockResolvedValueOnce(undefined);
    await wrapper.find('.google-btn').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.snackbar.show).toBe(true);
    expect(wrapper.vm.snackbar.message).toBe('Login successful');
    expect(wrapper.vm.snackbar.color).toBe('success');
  });

  it('displays error message on Google Sign-In failure', async () => {
    authStore.loginWithGoogle.mockRejectedValueOnce({ message: 'Google auth failed' });
    await wrapper.find('.google-btn').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.snackbar.show).toBe(true);
    expect(wrapper.vm.snackbar.message).toBe('Google auth failed');
    expect(wrapper.vm.snackbar.color).toBe('error');
  });

  it('navigates to signup page when clicking signup link', async () => {
    const signupLink = wrapper.find('.ml-1.font-weight-medium');
    expect(signupLink.exists()).toBe(true);
    await signupLink.trigger('click');
    await wrapper.vm.$nextTick();
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });
});