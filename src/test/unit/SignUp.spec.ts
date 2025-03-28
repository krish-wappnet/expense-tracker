import { mount } from "@vue/test-utils";
import SignUp from "../../components/auth/SignUp.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "vue-router";
import { signUp } from "@/services/authService";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
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

// Type definition for SignUp.vue instance
interface SignUpInstance extends ComponentPublicInstance {
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

// Mock API service
vi.mock("@/services/authService", () => ({
  signUp: vi.fn(),
}));

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("SignUp.vue", () => {
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

  it("renders the signup form correctly", () => {
    const wrapper = mountWithVuetify(SignUp);
    expect(wrapper.find("h1").text()).toBe("signUp");
    expect(wrapper.find("input[type='email']").exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").text()).toContain("signUp");
  });

  it("shows validation errors when submitting empty form", async () => {
    const wrapper = mountWithVuetify(SignUp);
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const emailField = wrapper.findComponent({ name: "v-text-field" }).vm;
    const passwordField = wrapper.findAllComponents({ name: "v-text-field" })[1].vm;
    expect(emailField.errorMessages).toContain("emailRequired");
    expect(passwordField.errorMessages).toContain("passwordRequired");
  });

  it("disables button when loading", async () => {
    const wrapper = mountWithVuetify(SignUp);
    (wrapper.vm as unknown as SignUpInstance).loading = true;
    await wrapper.vm.$nextTick();
    const button = wrapper.find("button[type='submit']");
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows an error when email is invalid", async () => {
    const wrapper = mountWithVuetify(SignUp);
    await wrapper.find("input[type='email']").setValue("invalid-email");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const emailField = wrapper.findComponent({ name: "v-text-field" }).vm;
    expect(emailField.errorMessages).toContain("emailInvalid");
  });

  it("calls signUp API when form is valid", async () => {
    const mockSignUp = signUp as ReturnType<typeof vi.fn>;
    mockSignUp.mockResolvedValue({ message: "Signup Successful" });

    const wrapper = mountWithVuetify(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("displays success message on successful signup", async () => {
    const mockSignUp = signUp as ReturnType<typeof vi.fn>;
    mockSignUp.mockResolvedValue({ message: "Signup Successful" });

    const wrapper = mountWithVuetify(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as SignUpInstance).snackbar.message).toContain("Signup Successful");
  });

  it("displays error message on signup failure", async () => {
    const mockSignUp = signUp as ReturnType<typeof vi.fn>;
    mockSignUp.mockRejectedValue({ response: { data: { message: "Signup failed" } } });

    const wrapper = mountWithVuetify(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findComponent({ name: "v-snackbar" });
    expect(snackbar.vm.modelValue).toBe(true);
    expect((wrapper.vm as unknown as SignUpInstance).snackbar.message).toContain("Signup failed");
  });
});