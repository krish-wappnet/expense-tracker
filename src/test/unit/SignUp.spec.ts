import { mount } from "@vue/test-utils";
import SignUp from "../../components/auth/SignUp.vue";
import { describe, it, expect, vi } from "vitest";
import { useRouter } from "vue-router";
import { signUp } from "@/services/authService";

// Mock Vue Router
vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock API service
vi.mock("@/services/authService", () => ({
  signUp: vi.fn(),
}));

describe("SignUp.vue", () => {
  it("renders the signup form correctly", () => {
    const wrapper = mount(SignUp);
    expect(wrapper.find("h1").text()).toBe("Sign Up");
    expect(wrapper.find("input[type='email']").exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
    expect(wrapper.find("button").text()).toBe("Sign Up");
  });

  it("shows validation errors when submitting empty form", async () => {
    const wrapper = mount(SignUp);
    await wrapper.find("button").trigger("click");

    expect(wrapper.text()).toContain("Email is required");
    expect(wrapper.text()).toContain("Password is required");
  });

  it("disables button when loading", async () => {
    const wrapper = mount(SignUp);
    await wrapper.setData({ loading: true });

    expect(wrapper.find("button").element.disabled).toBe(true);
  });

  it("shows an error when email is invalid", async () => {
    const wrapper = mount(SignUp);
    await wrapper.find("input[type='email']").setValue("invalid-email");
    await wrapper.find("button").trigger("click");

    expect(wrapper.text()).toContain("Invalid email");
  });

  it("calls signUp API when form is valid", async () => {
    (signUp as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ message: "Signup Successful" });

    const wrapper = mount(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("button").trigger("click");

    expect(signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("displays success message on successful signup", async () => {
    (signUp as any).mockResolvedValue({ message: "Signup Successful" });

    const wrapper = mount(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("button").trigger("click");

    expect(wrapper.text()).toContain("Signup Successful");
  });

  it("displays error message on signup failure", async () => {
    (signUp as any).mockRejectedValue({ response: { data: { message: "Signup failed" } } });

    const wrapper = mount(SignUp);
    await wrapper.find("input[type='email']").setValue("test@example.com");
    await wrapper.find("input[type='password']").setValue("password123");
    await wrapper.find("button").trigger("click");

    expect(wrapper.text()).toContain("Signup failed");
  });
});
