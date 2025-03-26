<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card elevation="6" class="mx-auto">
      <v-card-title class="headline primary white--text py-3">
        {{ isEdit ? t('editExpense') : t('addExpense') }}
      </v-card-title>
      <v-card-text class="pt-6">
        <!-- Custom Stepper Header -->
        <v-stepper v-model="step" flat>
          <v-stepper-header>
            <v-stepper-item :value="'1'" :title="t('basicDetails')" />
            <v-divider />
            <v-stepper-item :value="'2'" :title="t('dateDetails')" />
            <v-divider />
            <v-stepper-item :value="'3'" :title="t('categoryAndPayment')" />
            <v-divider />
            <v-stepper-item :value="'4'" :title="t('reviewAndSubmit')" />
          </v-stepper-header>
        </v-stepper>

        <!-- Custom Stepper Content with v-if -->
        <div v-if="step === '1'">
          <v-form ref="formStep1" @submit.prevent="nextStep(1)">
            <v-text-field
              v-model="form.title"
              :label="t('title')"
              :rules="[v => !!v || t('titleRequired'), v => v.length <= 100 || t('max100Characters')]"
              outlined
              dense
              required
              autofocus
              :aria-label="t('title')"
            />
            <v-text-field
              v-model.number="form.amount"
              :label="t('amount')"
              type="number"
              :rules="[v => (v !== null && v > 0) || t('amountMustBePositive')]"
              outlined
              dense
              required
              :aria-label="t('amount')"
            />
            <v-row class="mt-4">
              <v-col>
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
              <v-col>
                <v-btn color="grey" text @click="closeDialog" block>
                  {{ t('cancel') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <div v-if="step === '2'">
          <v-form ref="formStep2" @submit.prevent="nextStep(2)">
            <v-menu
              v-model="fromDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="form.date"
                  :label="t('date')"
                  :rules="[v => /^\d{2}-\d{2}-\d{4}$/.test(v) || t('invalidDateFormat')]"
                  placeholder="dd-mm-yyyy"
                  outlined
                  dense
                  required
                  readonly
                  v-bind="props"
                  :aria-label="t('date')"
                />
              </template>
              <v-date-picker
                v-model="fromDate"
                @update:modelValue="updateFromDate"
                :max="new Date().toISOString().split('T')[0]"
                no-title
                @click:cancel="fromDateMenu = false"
                @click:save="fromDateMenu = false"
              />
            </v-menu>

            <!-- Conditional "To Date" Field for Travel -->
            <div v-if="tempCategory === 'Travel'">
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="form.toDate"
                    :label="t('toDate')"
                    :rules="toDateRules"
                    placeholder="dd-mm-yyyy"
                    outlined
                    dense
                    readonly
                    v-bind="props"
                    :aria-label="t('toDate')"
                  />
                </template>
                <v-date-picker
                  v-model="toDate"
                  @update:modelValue="updateToDate"
                  :min="form.date"
                  :max="new Date().toISOString().split('T')[0]"
                  no-title
                  @click:cancel="toDateMenu = false"
                  @click:save="toDateMenu = false"
                />
              </v-menu>
            </div>

            <v-row class="mt-4">
              <v-col>
                <v-btn color="grey" text @click="step = '1'" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col>
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <div v-if="step === '3'">
          <v-form ref="formStep3" @submit.prevent="nextStep(3)">
            <v-select
              v-model="form.category"
              :items="categories.map(cat => ({ value: cat, text: t(`categories.${cat.toLowerCase()}`) }))"
              :label="t('category')"
              :rules="[v => !!v || t('categoryRequired')]"
              outlined
              dense
              required
              item-title="text"
              item-value="value"
              :aria-label="t('category')"
            />
            <v-select
              v-model="form.paymentMethod"
              :items="paymentMethods.map(method => ({ value: method, text: t(`paymentMethods.${method.toLowerCase()}`) }))"
              :label="t('paymentMethod')"
              :rules="[v => !!v || t('paymentMethodRequired')]"
              outlined
              dense
              required
              item-title="text"
              item-value="value"
              :aria-label="t('paymentMethod')"
            />
            <v-row class="mt-4">
              <v-col>
                <v-btn color="grey" text @click="goBackToStep2" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col>
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <div v-if="step === '4'">
          <v-form ref="formStep4" @submit.prevent="saveExpense">
            <v-card flat class="mb-4">
              <v-card-text>
                <h3 class="mb-2">{{ t('reviewYourExpense') }}</h3>
                <p><strong>{{ t('title') }}:</strong> {{ form.title }}</p>
                <p><strong>{{ t('amount') }}:</strong> {{ formatCurrency(form.amount) }}</p>
                <p><strong>{{ t('date') }}:</strong> {{ form.date }}</p>
                <p v-if="form.category === 'Travel' && form.toDate">
                  <strong>{{ t('toDate') }}:</strong> {{ form.toDate }}
                </p>
                <p><strong>{{ t('category') }}:</strong> {{ form.category }}</p>
                <p><strong>{{ t('paymentMethod') }}:</strong> {{ form.paymentMethod }}</p>
              </v-card-text>
            </v-card>
            <v-row class="mt-4">
              <v-col>
                <v-btn color="grey" text @click="step = '3'" block>
                  {{ t('back') }}
                </v-btn>
              </v-col>
              <v-col>
                <v-btn color="primary" type="submit" block elevation="2">
                  {{ t('submit') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar for Expense Action Confirmation -->
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2000"
      color="success"
      class="custom-snackbar"
      :class="{ 'dark-mode': isDarkMode }"
      location="top right"
    >
      {{ isEdit ? t('expenseUpdated') : t('expenseAdded') }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
          class="snackbar-close-btn"
        >
          {{ t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, reactive } from "vue";
import { useExpenseStore } from "@/stores/expenseStore";
import type { Expense } from "@/types/expense";
import type { VForm } from "vuetify/components";
import { useI18n } from 'vue-i18n';

// Extend the Expense interface to include optional toDate field
interface ExtendedExpense extends Expense {
  toDate?: string | null;
}

// Define props and emits
const props = defineProps<{
  show: boolean;
  expense?: ExtendedExpense;
}>();
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

// Store
const store = useExpenseStore();
const dialog = ref(props.show);

// Use i18n for translations
const { t, locale } = useI18n();

// Use `reactive()` for form state with toDate field for travel
const form = reactive({
  title: "",
  amount: 0,
  date: "",
  category: null as Expense["category"] | null,
  paymentMethod: null as Expense["paymentMethod"] | null,
  toDate: null as string | null,
});

// Temporary category to use in Step 2
const tempCategory = ref<Expense["category"] | null>(null);

// Form References for Validation with proper typing
const formStep1 = ref<VForm | null>(null);
const formStep2 = ref<VForm | null>(null);
const formStep3 = ref<VForm | null>(null);
const formStep4 = ref<VForm | null>(null);

// Stepper State
const step = ref("1");

// Date Picker State
const fromDateMenu = ref(false);
const toDateMenu = ref(false);
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);

// Snackbar State
const showSnackbar = ref(false);

// Dropdown Options
const categories: Array<Expense["category"]> = ["Food", "Travel", "Shopping", "Bills", "Others"];
const paymentMethods: Array<Expense["paymentMethod"]> = ["Cash", "Card", "Online"];
const isEdit = computed(() => !!props.expense);

// Check if dark mode is enabled
const isDarkMode = computed(() => document.documentElement.classList.contains('dark-mode'));

// Format date to dd-mm-yyyy
const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Parse date string (dd-mm-yyyy) to Date object for comparison
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Validation rule for To Date
const toDateRules = computed(() => [
  (v: string) =>
    tempCategory.value !== "Travel" ||
    (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) ||
    t('invalidDateFormat'),
  (v: string) =>
    tempCategory.value !== "Travel" ||
    !v ||
    !form.date ||
    (parseDate(v) && parseDate(form.date) && parseDate(v)! >= parseDate(form.date)!) ||
    t('toDateCannotBeEarlier'),
]);

// Format the amount with the currency symbol based on the locale
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'INR', // You can make this dynamic based on user settings
  }).format(value);
};

// Update From Date
const updateFromDate = (date: Date | null) => {
  form.date = formatDate(date);
  fromDateMenu.value = false;
};

// Update To Date
const updateToDate = (date: Date | null) => {
  form.toDate = formatDate(date);
  toDateMenu.value = false;
};

// Sync dialog with props.show and reset form
watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
    if (newVal) {
      if (props.expense) {
        Object.assign(form, {
          title: props.expense.title,
          amount: props.expense.amount,
          date: props.expense.date,
          category: props.expense.category,
          paymentMethod: props.expense.paymentMethod,
          toDate: props.expense.toDate ?? null,
        });
        tempCategory.value = props.expense.category;
        // Parse dates for the date pickers
        if (props.expense.date) {
          const [day, month, year] = props.expense.date.split("-").map(Number);
          fromDate.value = new Date(year, month - 1, day);
        }
        if (props.expense.toDate) {
          const [day, month, year] = props.expense.toDate.split("-").map(Number);
          toDate.value = new Date(year, month - 1, day);
        }
      } else {
        Object.assign(form, {
          title: "",
          amount: 0,
          date: "",
          category: null,
          paymentMethod: null,
          toDate: null,
        });
        tempCategory.value = null;
        fromDate.value = null;
        toDate.value = null;
      }
      step.value = "1"; // Reset to first step when dialog opens
      formStep1.value?.resetValidation();
      formStep2.value?.resetValidation();
      formStep3.value?.resetValidation();
      formStep4.value?.resetValidation();
    }
  }
);

// Emit dialog state changes to parent
watch(dialog, (val) => {
  emit("update:show", val);
});

// Watch for category changes to update tempCategory
watch(
  () => form.category,
  (newVal) => {
    tempCategory.value = newVal;
  }
);

// Watch step changes for debugging
watch(step, (newVal) => {
  console.log(`Current step: ${newVal}`);
});

// Navigate to next step after validation
const nextStep = async (currentStep: number) => {
  let formRef: VForm | null = null;
  if (currentStep === 1) formRef = formStep1.value;
  else if (currentStep === 2) formRef = formStep2.value;
  else if (currentStep === 3) formRef = formStep3.value;

  // Ensure formRef is defined before proceeding
  if (!formRef) {
    console.error(`Form reference for step ${currentStep} is undefined`);
    return;
  }

  const { valid } = await formRef.validate();
  if (!valid) return;

  step.value = String(currentStep + 1);
};

// Go back to Step 2 and preserve tempCategory
const goBackToStep2 = () => {
  tempCategory.value = form.category; // Preserve the category value
  step.value = "2";
};

// Save Expense
const saveExpense = async () => {
  const expenseData: Omit<ExtendedExpense, "id"> = {
    title: form.title!,
    amount: form.amount!,
    date: form.date!,
    category: form.category!,
    paymentMethod: form.paymentMethod!,
    toDate: form.category === "Travel" ? form.toDate : null,
  };

  if (isEdit.value && props.expense?.id) {
    store.updateExpense(props.expense.id, expenseData);
  } else {
    store.addExpense(expenseData);
  }
  showSnackbar.value = true; // Show snackbar on successful save
  closeDialog();
};

// Close Dialog and Reset Form
const closeDialog = () => {
  dialog.value = false;
  emit("update:show", false);
};
</script>

<style scoped>
.custom-snackbar {
  transition: all 0.3s ease;
}

.snackbar-close-btn {
  color: #ffffff !important; /* Ensure the "Close" button text is white for visibility */
}
</style>