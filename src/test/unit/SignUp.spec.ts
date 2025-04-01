import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import { defineComponent } from 'vue';
import SignUp from '../../components/auth/SignUp.vue'; // Adjusted path
import { useAuthStore } from '@/stores/auth';
import { mockPush } from '../../test/setup.ts'; // Adjusted path

const messages = {
  en: {
    signUp: 'Sign Up',
    email: 'Email',
    displayName: 'Display Name',
    password: 'Password',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    displayNameRequired: 'Display name is required',
    displayNameTooLong: 'Display name must be 50 characters or less',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordNeedsUppercase: 'Password must contain an uppercase letter',
    passwordNeedsNumber: 'Password must contain a number',
    passwordNeedsSpecial: 'Password must contain a special character',
    signupSuccess: 'Sign up successful',
    signUpFailed: 'Sign up failed',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Login',
    close: 'Close',
    emailInUse: 'Email is already in use',
    passwordStrength: { weak: 'Weak', medium: 'Medium', strong: 'Strong' },
  },
};

interface AuthStore {
  signUp: ReturnType<typeof vi.fn>;
}

interface SignUpInstance {
  loading: boolean;
  snackbar: { show: boolean; message: string; color: string };
  form: { email: string; displayName: string; password: string };
  errors: { email: string; displayName: string; password: string };
  passwordStrengthColor: string;
  hasErrors: boolean;
  $nextTick: () => Promise<void>;
}

const DummyComponent = defineComponent({ render: () => null });

describe('SignUp.vue', () => {
  let wrapper: VueWrapper<SignUpInstance>;
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
    authStore.signUp = vi.fn();

    i18n = createI18n({ legacy: false, locale: 'en', messages });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'login', component: DummyComponent },
        { path: '/dashboard', name: 'dashboard', component: DummyComponent },
        { path: '/', name: 'root', component: DummyComponent },
      ],
    });
    router.push('/');

    wrapper = mount(SignUp, {
      global: {
        plugins: [vuetify, pinia, i18n, router],
      },
    }) as VueWrapper<SignUpInstance>;

    mockPush.mockClear();
  });

  it('renders signup form correctly', () => {
    expect(wrapper.find('.signup-container').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Sign Up');
    expect(wrapper.findAll('input').length).toBe(3);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign Up');
  });

  it('displays form fields with correct labels', () => {
    const inputs = wrapper.findAll('.v-text-field');
    expect(inputs[0].find('.v-label').text()).toBe('Email');
    expect(inputs[1].find('.v-label').text()).toBe('Display Name');
    expect(inputs[2].find('.v-label').text()).toBe('Password');
  });

  it('toggles password visibility', async () => {
    const passwordField = wrapper.findAll('.v-text-field')[2];
    const input = passwordField.find('input');
    const toggleIcon = passwordField.find('.mdi-eye');
    expect(input.attributes('type')).toBe('password');
    await toggleIcon.trigger('click');
    expect(input.attributes('type')).toBe('text');
  });

  it('validates email on blur', async () => {
    const emailInput = wrapper.findAll('input')[0];
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.errors.email).toBe('Email is invalid');
  });

  it('validates display name on blur', async () => {
    const displayNameInput = wrapper.findAll('input')[1];
    await displayNameInput.setValue('');
    await displayNameInput.trigger('blur');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.errors.displayName).toBe('Display name is required');
  });

  it('validates password and updates strength on input', async () => {
    const passwordInput = wrapper.findAll('input')[2];
    await passwordInput.setValue('');
    await passwordInput.trigger('input');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.errors.password).toBe('Password is required');
    expect(wrapper.vm.passwordStrengthColor).toBe('red');
  });

  it('disables submit button when there are errors', async () => {
    const submitBtn = wrapper.find('button[type="submit"]');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.hasErrors).toBe(true);
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true); // Cast to HTMLButtonElement

    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.displayName = 'TestUser';
    wrapper.vm.form.password = 'Password123!';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.hasErrors).toBe(false);
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('handles successful signup', async () => {
    authStore.signUp.mockResolvedValueOnce({});
    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.displayName = 'TestUser';
    wrapper.vm.form.password = 'Password123!';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(authStore.signUp).toHaveBeenCalledWith('test@example.com', 'Password123!', 'TestUser');
    expect(wrapper.vm.snackbar.show).toBe(true);
  });

  it('handles signup failure', async () => {
    authStore.signUp.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    wrapper.vm.form.email = 'existing@example.com';
    wrapper.vm.form.displayName = 'TestUser';
    wrapper.vm.form.password = 'Password123!';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.snackbar.show).toBe(true);
    expect(wrapper.vm.snackbar.color).toBe('error');
  });

  it('shows loading state during signup', async () => {
    authStore.signUp.mockImplementation(() => new Promise(() => {}));
    const submitBtn = wrapper.find('button[type="submit"]');
    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.displayName = 'TestUser';
    wrapper.vm.form.password = 'Password123!';
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.loading).toBe(true);
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true); // Cast to HTMLButtonElement
  });

  it('navigates to login page when clicking login link', async () => {
    const loginLink = wrapper.find('.ml-1.font-weight-medium');
    expect(loginLink.exists()).toBe(true);
    await loginLink.trigger('click');
    await wrapper.vm.$nextTick();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});