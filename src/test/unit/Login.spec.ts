import { mount } from "@vue/test-utils";
import Login from "../../components/auth/Login.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { useAuthStore } from "@/stores/auth";
import type { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions, ComponentPublicInstance } from "vue";

// Mock ResizeObserver before imports
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Type definition for Login.vue instance
interface LoginInstance extends ComponentPublicInstance {
  loading: boolean;
  snackbar: { show: boolean; message: string; color: string };
}

// Create Vuetify instance for testing
const vuetify = createVuetify({ components, directives });

// Mock Vue Router
vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock authService (not directly used, but imported in Login.vue)
vi.mock("@/services/authService", () => ({
  login: vi.fn(),
}));

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useAuthStore
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
  })),
}));

describe("Login.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountWithVuetify = (
    component: DefineComponent<
      {},
      {},
      {},
      {},
      {},
      ComponentOptionsMixin,
      ComponentOptionsMixin,
      {},
      string,
      PublicProps,
      Readonly<{}> & Readonly<{}>,
      {},
      {},
      {},
      {},
      string,
      ComponentProvideOptions,
      true,
      {},
      any
    >
  ) =>
    mount(component, {
      global: {
        plugins: [vuetify],
      },
    });

  it("renders the login form correctly", () => {
    const wrapper = mountWithVuetify(Login);
    expect(wrapper.find("h1").text()).toBe("login");
    expect(wrapper.find("input[type='email']").exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").text()).toContain("login");
    expect(wrapper.find(".v-btn .mdi-google").exists()).toBe(true);
    expect(wrapper.find(".v-btn").text()).toContain("signInWithGoogle");
  });

  it("shows validation errors when submitting empty form", async () => {
    const wrapper = mountWithVuetify(Login);
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const emailField = wrapper.findComponent({ name: "v-text-field" }).vm;
    const passwordField = wrapper.findAllComponents({ name: "v-text-field" })[1].vm;
    expect(emailField.errorMessages).toContain("emailRequired");
    expect(passwordField.errorMessages).toContain("passwordRequired");
  });

  it("disables buttons when loading", async () => {
    const wrapper = mountWithVuetify(Login);
    (wrapper.vm as unknown as LoginInstance).loading = true;
    await wrapper.vm.$nextTick();

    const loginButton = wrapper.find("button[type='submit']");
    const googleButton = wrapper.find(".v-btn.mdi-google").element.parentElement as HTMLButtonElement;
    expect((loginButton.element as HTMLButtonElement).disabled).toBe(true);
    expect(googleButton.disabled).toBe(true);
  });

  it("shows an error when email is invalid", async () => {
    const wrapper = mountWithVuetify(Login);
    await wrapper.find("input[type='email']").setValue("invalid-email");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const emailField = wrapper.findComponent({ name: "v-text-field" }).vm;
    expect(emailField.errorMessages).toContain("emailInvalid");
  });

  it("calls login API when form is valid", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.login.mockResolvedValue(undefined);

    const wrapper = mountWithVuetify(Login);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(mockAuthStore.login).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("displays success message on successful login", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.login.mockResolvedValue(undefined);

    const wrapper = mountWithVuetify(Login);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as LoginInstance).snackbar.message).toContain("loginSuccess");
  });

  it("displays error message on login failure", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.login.mockRejectedValue({ response: { status: 401 } });

    const wrapper = mountWithVuetify(Login);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as LoginInstance).snackbar.message).toContain("invalidCredentials");
  });

  it("calls Google Sign-In when button is clicked", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.loginWithGoogle.mockResolvedValue(undefined);

    const wrapper = mountWithVuetify(Login);
    const googleButton = wrapper.find(".v-btn.mdi-google").element.parentElement as HTMLElement;
    await googleButton.click();
    await wrapper.vm.$nextTick();

    expect(mockAuthStore.loginWithGoogle).toHaveBeenCalled();
  });

  it("displays success message on successful Google Sign-In", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.loginWithGoogle.mockResolvedValue(undefined);

    const wrapper = mountWithVuetify(Login);
    const googleButton = wrapper.find(".v-btn.mdi-google").element.parentElement as HTMLElement;
    await googleButton.click();
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as LoginInstance).snackbar.message).toContain("loginSuccess");
  });

  it("displays error message on Google Sign-In failure", async () => {
    const mockAuthStore = useAuthStore();
    mockAuthStore.loginWithGoogle.mockRejectedValue({ message: "Google auth failed" });

    const wrapper = mountWithVuetify(Login);
    const googleButton = wrapper.find(".v-btn.mdi-google").element.parentElement as HTMLElement;
    await googleButton.click();
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as LoginInstance).snackbar.message).toContain("Google auth failed");
  });
});