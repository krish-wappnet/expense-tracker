// tests/unit/SignUp.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent } from 'vue'
import SignUp from '@/components/SignUp.vue'
import { useAuthStore } from '@/stores/auth'

// Mock messages for i18n
const messages = {
  en: {
    signUp: 'Sign Up',
    email: 'Email',
    displayName: 'Display Name',
    password: 'Password',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    displayNameRequired: 'Display name is required',
    signupSuccess: 'Sign up successful',
    signUpFailed: 'Sign up failed',
  }
}

// Define interface for auth store with mocked signUp
interface AuthStore {
  signUp: vi.Mock<[string, string, string], Promise<any>> // Changed Vi.Mock to vi.Mock
}

// Define interface for SignUp component instance
interface SignUpInstance {
  loading: boolean
  snackbar: {
    show: boolean
    message: string
    color: string
  }
  $nextTick: () => Promise<void>
}

// Dummy component for testing routes
const DummyComponent = defineComponent({
  render: () => null
})

describe('SignUp.vue', () => {
  let wrapper: VueWrapper<SignUpInstance>
  let vuetify: ReturnType<typeof createVuetify>
  let pinia: ReturnType<typeof createPinia>
  let i18n: ReturnType<typeof createI18n>
  let router: ReturnType<typeof createRouter>
  let authStore: AuthStore

  beforeEach(() => {
    // Setup Vuetify
    vuetify = createVuetify({
      components,
      directives,
    })

    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore() as unknown as AuthStore

    // Mock auth store
    authStore.signUp = vi.fn()

    // Setup i18n
    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages,
    })

    // Setup router with proper RouteRecordRaw
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'login', component: DummyComponent },
        { path: '/dashboard', name: 'dashboard', component: DummyComponent },
      ],
    })
    router.push = vi.fn()

    // Mount component
    wrapper = mount(SignUp, {
      global: {
        plugins: [vuetify, pinia, i18n, router],
      },
    }) as VueWrapper<SignUpInstance>
  })

  // Test 1: Component Rendering
  it('renders signup form correctly', () => {
    expect(wrapper.find('.signup-container').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Sign Up')
    expect(wrapper.findAll('input').length).toBe(3) // email, displayName, password
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign Up')
  })

  // Test 2: Form Fields
  it('displays form fields with correct labels', () => {
    const inputs = wrapper.findAll('.v-text-field')
    expect(inputs[0].find('.v-label').text()).toBe('Email')
    expect(inputs[1].find('.v-label').text()).toBe('Display Name')
    expect(inputs[2].find('.v-label').text()).toBe('Password')
  })

  // Test 3: Password Visibility Toggle
  it('toggles password visibility', async () => {
    const passwordField = wrapper.findAll('.v-text-field')[2]
    const input = passwordField.find('input')
    const toggleIcon = passwordField.find('.mdi-eye')

    expect(input.attributes('type')).toBe('password')
    await toggleIcon.trigger('click')
    expect(input.attributes('type')).toBe('text')
    await toggleIcon.trigger('click')
    expect(input.attributes('type')).toBe('password')
  })

  // Test 4: Form Validation
  it('shows validation errors on empty submit', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(wrapper.findAll('.v-messages__message').length).toBe(3)
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Display name is required')
    expect(wrapper.text()).toContain('Password is required')
  })

  // Test 5: Email Validation
  it('validates email format', async () => {
    await wrapper.findAll('input')[0].setValue('invalid-email')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Email is invalid')
  })

  // Test 6: Successful Signup
  it('handles successful signup', async () => {
    authStore.signUp.mockResolvedValueOnce({})
    
    await wrapper.findAll('input')[0].setValue('test@example.com')
    await wrapper.findAll('input')[1].setValue('TestUser')
    await wrapper.findAll('input')[2].setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    expect(authStore.signUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'TestUser'
    )
    expect(wrapper.vm.snackbar.show).toBe(true)
    expect(wrapper.vm.snackbar.message).toBe('Sign up successful')
    expect(wrapper.vm.snackbar.color).toBe('success')
  })

  // Test 7: Failed Signup
  it('handles signup failure', async () => {
    authStore.signUp.mockRejectedValueOnce({ code: 'auth/email-already-in-use' })
    
    await wrapper.findAll('input')[0].setValue('existing@example.com')
    await wrapper.findAll('input')[1].setValue('TestUser')
    await wrapper.findAll('input')[2].setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.snackbar.show).toBe(true)
    expect(wrapper.vm.snackbar.color).toBe('error')
  })

  // Test 8: Loading State
  it('shows loading state during signup', async () => {
    authStore.signUp.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    const submitBtn = wrapper.find('button[type="submit"]')
    await wrapper.findAll('input')[0].setValue('test@example.com')
    await wrapper.findAll('input')[1].setValue('TestUser')
    await wrapper.findAll('input')[2].setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.vm.loading).toBe(true)
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  // Test 9: Login Link
  it('navigates to login page when clicking login link', async () => {
    const loginLink = wrapper.find('button[color="primary"]')
    await loginLink.trigger('click')
    expect(router.push).toHaveBeenCalledWith('/login')
  })
})