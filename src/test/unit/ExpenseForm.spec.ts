import { mount } from "@vue/test-utils";
import ExpenseForm from "../../components/ExpenseForm.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVuetify } from "vuetify";
import { VDialog, VCard, VCardTitle, VStepper, VForm, VTextField, VSelect, VAutocomplete, VBtn, VList, VListItem } from "vuetify/components";
import * as directives from "vuetify/directives";
import { useExpenseStore } from "@/stores/expenseStore";
import { useAuthStore } from "@/stores/auth";
import type { ComponentPublicInstance } from "vue";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Type definition for ExpenseForm.vue instance
interface ExpenseFormInstance {
  step: string;
  form: {
    title: string;
    amount: number;
    date: string;
    category: string | null;
    paymentMethod: string | null;
    userId: number;
    sharedWith: { userId: string; share: number }[];
  };
  loading: boolean;
  snackbar: { show: boolean; message: string; color: string };
  selectedUser: any;
  fromDateMenu: boolean;
  dialog: boolean;
  nextStep(currentStep: number | string): Promise<void>;
  saveExpense(): Promise<void>;
}

// Create Vuetify instance with explicit components
const vuetify = createVuetify({
  components: {
    VDialog,
    VCard,
    VCardTitle,
    VStepper,
    VForm,
    VTextField,
    VSelect,
    VAutocomplete,
    VBtn,
    VList,
    VListItem,
  },
  directives,
});

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: "en" },
  }),
}));

// Mock vuetify
vi.mock("vuetify", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    useDisplay: () => ({
      smAndDown: { value: false },
      mdAndDown: { value: false },
    }),
  };
});

// Mock expenseStore
const mockExpenseStore = {
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
  fetchUsers: vi.fn(),
  users: [
    { id: "2", name: "Jane", email: "jane@example.com" },
    { id: "3", name: "Bob", email: "bob@example.com" },
  ],
  getUserName: vi.fn((id) => mockExpenseStore.users.find((u) => u.id === id)?.name || ""),
  getUserEmail: vi.fn((id) => mockExpenseStore.users.find((u) => u.id === id)?.email || ""),
};
vi.mock("@/stores/expenseStore", () => ({
  useExpenseStore: vi.fn(() => mockExpenseStore),
}));

// Mock authStore
const mockAuthStore = {
  currentUser: { id: "1", name: "John", email: "john@example.com" },
  getToken: "mock-token",
};
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

describe("ExpenseForm.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExpenseStore.fetchUsers.mockResolvedValue(undefined);
  });

  const mountWithVuetify = async (options = {}) => {
    const wrapper = mount(ExpenseForm, {
      global: {
        plugins: [vuetify],
      },
      props: { show: true },
      ...options,
    });
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.dialog = true; // Force dialog open
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    // Extra delay to ensure DOM updates
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("Rendered HTML:", wrapper.html());
    return wrapper;
  };

  it("renders correctly with dialog and stepper", async () => {
    const wrapper = await mountWithVuetify();
    expect(wrapper.findComponent({ name: "v-dialog" }).props("modelValue")).toBe(true);
    expect(wrapper.find(".v-card-title").text()).toBe("addExpense");
    expect(wrapper.findAll(".v-stepper-item").length).toBe(4);
    expect(wrapper.find(".v-stepper-item:nth-child(1)").text()).toContain("basicDetails");
    expect(wrapper.find("input[aria-label='title']").exists()).toBe(true);
    expect(wrapper.find("input[aria-label='amount']").exists()).toBe(true);
  });

  it("validates Step 1 and moves to Step 2", async () => {
    const wrapper = await mountWithVuetify();
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const titleField = wrapper.findComponent({ name: "v-text-field" }).vm;
    expect(titleField.errorMessages).toContain("titleRequired");

    await wrapper.find("input[aria-label='title']").setValue("Dinner");
    await wrapper.find("input[aria-label='amount']").setValue("50");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as unknown as ExpenseFormInstance).step).toBe("2");
  });

  it("validates Step 2 and moves to Step 3", async () => {
    const wrapper = await mountWithVuetify();
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.step = "2";
    await wrapper.vm.$nextTick();
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const dateField = wrapper.findComponent({ name: "v-text-field" }).vm;
    expect(dateField.errorMessages).toContain("invalidDateFormat");

    vm.form.date = "15-10-2023";
    await wrapper.vm.$nextTick();
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(vm.step).toBe("3");
  });

  it("validates Step 3 and moves to Step 4", async () => {
    const wrapper = await mountWithVuetify();
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.step = "3";
    await wrapper.vm.$nextTick();
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    const categoryField = wrapper.findAllComponents({ name: "v-select" })[0].vm;
    const paymentField = wrapper.findAllComponents({ name: "v-select" })[1].vm;
    expect(categoryField.errorMessages).toContain("categoryRequired");
    expect(paymentField.errorMessages).toContain("paymentMethodRequired");

    await wrapper.findAllComponents({ name: "v-select" })[0].setValue("Food");
    await wrapper.findAllComponents({ name: "v-select" })[1].setValue("Cash");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(vm.step).toBe("4");
  });

  it("adds and removes shared users in Step 3", async () => {
    const wrapper = await mountWithVuetify();
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.step = "3";
    await wrapper.vm.$nextTick();

    await wrapper.findComponent({ name: "v-autocomplete" }).setValue({ id: "2", name: "Jane" });
    await wrapper.find("button.elevation-2").trigger("click");
    await wrapper.vm.$nextTick();

    expect(vm.form.sharedWith).toEqual([{ userId: "2", share: 0 }]);
    expect(wrapper.find(".shared-user-item").text()).toContain("Jane");

    await wrapper.find(".shared-user-item .v-btn").trigger("click");
    await wrapper.vm.$nextTick();

    expect(vm.form.sharedWith).toEqual([]);
  });

  it("submits new expense successfully", async () => {
    mockExpenseStore.addExpense.mockResolvedValue(undefined);
    const wrapper = await mountWithVuetify();
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.form.title = "Dinner";
    vm.form.amount = 100;
    vm.form.date = "15-10-2023";
    vm.form.category = "Food";
    vm.form.paymentMethod = "Cash";
    vm.form.sharedWith = [{ userId: "2", share: 0 }];
    vm.step = "4";
    await wrapper.vm.$nextTick();

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockExpenseStore.addExpense).toHaveBeenCalledWith({
      title: "Dinner",
      amount: 100,
      date: "15-10-2023",
      category: "Food",
      paymentMethod: "Cash",
      userId: 1,
      sharedWith: [{ userId: "2", share: 50 }],
    });
    expect(vm.snackbar.show).toBe(true);
    expect(vm.snackbar.message).toBe("expenseAdded");
  });

  it("updates existing expense successfully", async () => {
    mockExpenseStore.updateExpense.mockResolvedValue(undefined);
    const wrapper = await mountWithVuetify({
      props: {
        show: true,
        expense: {
          id: "123",
          title: "Lunch",
          amount: 60,
          date: "10-10-2023",
          category: "Food",
          paymentMethod: "Card",
          userId: 1,
          sharedWith: [],
        },
      },
    });
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.step = "4";
    await wrapper.vm.$nextTick();

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockExpenseStore.updateExpense).toHaveBeenCalledWith({
      id: "123",
      title: "Lunch",
      amount: 60,
      date: "10-10-2023",
      category: "Food",
      paymentMethod: "Card",
      userId: 1,
      sharedWith: [],
    });
    expect(vm.snackbar.show).toBe(true);
    expect(vm.snackbar.message).toBe("expenseUpdated");
  });

  it("shows error on submit failure", async () => {
    mockExpenseStore.addExpense.mockRejectedValue(new Error("Network error"));
    const wrapper = await mountWithVuetify();
    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    vm.form.title = "Dinner";
    vm.form.amount = 100;
    vm.form.date = "15-10-2023";
    vm.form.category = "Food";
    vm.form.paymentMethod = "Cash";
    vm.step = "4";
    await wrapper.vm.$nextTick();

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(vm.snackbar.show).toBe(true);
    expect(vm.snackbar.message).toBe("Network error");
  });

  it("pre-fills form in edit mode", async () => {
    const wrapper = await mountWithVuetify({
      props: {
        show: true,
        expense: {
          id: "123",
          title: "Lunch",
          amount: 60,
          date: "10-10-2023",
          category: "Food",
          paymentMethod: "Card",
          userId: 1,
          sharedWith: [{ userId: "2", share: 30 }],
        },
      },
    });
    // Manually trigger watch by toggling show
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as unknown as ExpenseFormInstance;
    expect(vm.form.title).toBe("Lunch");
    expect(vm.form.amount).toBe(60);
    expect(vm.form.date).toBe("10-10-2023");
    expect(vm.form.category).toBe("Food");
    expect(vm.form.paymentMethod).toBe("Card");
    expect(vm.form.sharedWith).toEqual([{ userId: "2", share: 30 }]);
    expect(wrapper.find(".v-card-title").text()).toBe("editExpense");
  });

  it("closes dialog on cancel", async () => {
    const wrapper = await mountWithVuetify();
    await wrapper.find("button[color='grey']").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:show")![0]).toEqual([false]);
  });
});