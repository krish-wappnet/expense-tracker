// src/i18n/index.ts
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    // Existing translations
    signUp: 'Sign Up',
    login: 'Login',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    signUpInstead: 'Sign Up Instead',
    signUpFailed: 'Sign up failed. Please try again.',
    loginFailed: 'Login failed. Please check your credentials.',
    expenseTracker: 'Expense Tracker',
    darkMode: 'Dark Mode',
    addExpense: 'Add Expense',
    clearAllData: 'Clear All Data',
    export: 'Export',
    import: 'Import',
    summary: 'Summary',
    totalExpenses: 'Total Expenses: {count}',
    totalAmount: 'Total Amount: ₹{amount}',
    averageAmount: 'Average Amount: ₹{amount}',
    filterByDateRange: 'Filter by Date Range',
    startDate: 'Start Date (dd-mm-yyyy)',
    endDate: 'End Date (dd-mm-yyyy)',
    clearDates: 'Clear Dates',
    confirmClearAllData: 'Confirm Clear All Data',
    clearAllDataMessage: 'Are you sure you want to clear all expenses? This action cannot be undone.',
    cancel: 'Cancel',
    clear: 'Clear',
    editExpense: 'Edit Expense',
    title: 'Title',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    paymentMethod: 'Payment Method',
    expenses: 'Expenses',
    searchByTitle: 'Search by Title',
    filterByCategory: 'Filter by Category',
    clearFilters: 'Clear Filters',
    actions: 'Actions',
    deleteExpense: 'Delete Expense',
    confirmDeletion: 'Confirm Deletion',
    confirmDeleteMessage: 'Are you sure you want to delete the expense "<strong>{title}</strong>"? This action cannot be undone.',
    delete: 'Delete',
    itemsPerPage: 'Items per page',
    sortBy: 'Sort by',
    pageText: 'Page {current} of {total}',
    categorySpending: 'Category Spending',
    paymentMethodSpending: 'Payment Method Spending',
    spendingByPaymentMethod: 'Spending by Payment Method',
    paymentMethodAxis: 'Payment Method',
    amountAxis: 'Amount (₹)',
    basicDetails: 'Basic Details',
    dateDetails: 'Date Details',
    categoryAndPayment: 'Category & Payment',
    reviewAndSubmit: 'Review & Submit',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    titleRequired: 'Title is required',
    max100Characters: 'Max 100 characters',
    amountMustBePositive: 'Amount must be positive',
    invalidDateFormat: 'Invalid format (dd-mm-yyyy)',
    toDateCannotBeEarlier: 'To Date cannot be earlier than From Date',
    categoryRequired: 'Category is required',
    paymentMethodRequired: 'Payment Method is required',
    reviewYourExpense: 'Review Your Expense',
    toDate: 'To Date',
    categories: {
      food: 'Food',
      travel: 'Travel',
      bills: 'Bills',
      entertainment: 'Entertainment',
      other: 'Other',
      shopping: 'Shopping',
      others: 'Others',
    },
    paymentMethods: {
      cash: 'Cash',
      card: 'Card',
      online: 'Online',
    },
    // New translations for enhanced UI
    language: 'Language',
    languageChanged: 'Language changed successfully',
    close: 'Close',
    expenseDeleted: 'Expense deleted successfully',
    profile: 'Profile',
    uploadProfilePicture: 'Upload Profile Picture',
    logout: 'Logout',
    loginSuccess: 'Login successful! Redirecting...',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 6 characters',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: 'Don’t have an account?',
    emailInUse: 'This email is already in use.',
    invalidCredentials: 'Invalid credentials.',
    noData: 'No Data',
    loading: 'Loading...',

    // Newly added translations
    expenseTrend: 'Expense Trend', // For the chart section title
    filters: 'Filters', // For the expansion panel title
    error: 'Error', // Generic error message for future use
    success: 'Success', // Generic success message for future use
    warning: 'Warning', // Generic warning message for future use

    Actions:"Actions",
    splitWith:"splitWith",
    yourShare:"yourShare"
  },
  fr: {
    // Existing translations
    signUp: 'S\'inscrire',
    login: 'Se connecter',
    name: 'Nom',
    email: 'Email',
    password: 'Mot de passe',
    signUpInstead: 'S\'inscrire à la place',
    signUpFailed: 'Échec de l\'inscription. Veuillez réessayer.',
    loginFailed: 'Échec de la connexion. Veuillez vérifier vos identifiants.',
    expenseTracker: 'Suivi des dépenses',
    darkMode: 'Mode sombre',
    addExpense: 'Ajouter une dépense',
    clearAllData: 'Effacer toutes les données',
    export: 'Exporter',
    import: 'Importer',
    summary: 'Résumé',
    totalExpenses: 'Dépenses totales : {count}',
    totalAmount: 'Montant total : ₹{amount}',
    averageAmount: 'Montant moyen : ₹{amount}',
    filterByDateRange: 'Filtrer par plage de dates',
    startDate: 'Date de début (jj-mm-aaaa)',
    endDate: 'Date de fin (jj-mm-aaaa)',
    clearDates: 'Effacer les dates',
    confirmClearAllData: 'Confirmer la suppression de toutes les données',
    clearAllDataMessage: 'Êtes-vous sûr de vouloir supprimer toutes les dépenses ? Cette action est irréversible.',
    cancel: 'Annuler',
    clear: 'Effacer',
    editExpense: 'Modifier la dépense',
    title: 'Titre',
    amount: 'Montant',
    date: 'Date',
    category: 'Catégorie',
    paymentMethod: 'Méthode de paiement',
    expenses: 'Dépenses',
    searchByTitle: 'Rechercher par titre',
    filterByCategory: 'Filtrer par catégorie',
    clearFilters: 'Effacer les filtres',
    actions: 'Actions',
    deleteExpense: 'Supprimer la dépense',
    confirmDeletion: 'Confirmer la suppression',
    confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer la dépense "<strong>{title}</strong>" ? Cette action est irréversible.',
    delete: 'Supprimer',
    itemsPerPage: 'Éléments par page',
    sortBy: 'Trier par',
    pageText: 'Page {current} sur {total}',
    categorySpending: 'Dépenses par catégorie',
    paymentMethodSpending: 'Dépenses par méthode de paiement',
    spendingByPaymentMethod: 'Dépenses par méthode de paiement',
    paymentMethodAxis: 'Méthode de paiement',
    amountAxis: 'Montant (₹)',
    basicDetails: 'Détails de base',
    dateDetails: 'Détails de la date',
    categoryAndPayment: 'Catégorie et paiement',
    reviewAndSubmit: 'Vérifier et soumettre',
    next: 'Suivant',
    back: 'Retour',
    submit: 'Soumettre',
    titleRequired: 'Le titre est requis',
    max100Characters: 'Maximum 100 caractères',
    amountMustBePositive: 'Le montant doit être positif',
    invalidDateFormat: 'Format invalide (jj-mm-aaaa)',
    toDateCannotBeEarlier: 'La date de fin ne peut pas être antérieure à la date de début',
    categoryRequired: 'La catégorie est requise',
    paymentMethodRequired: 'La méthode de paiement est requise',
    reviewYourExpense: 'Vérifiez votre dépense',
    toDate: 'Date de fin',
    categories: {
      food: 'Nourriture',
      travel: 'Voyage',
      bills: 'Factures',
      entertainment: 'Divertissement',
      other: 'Autre',
      shopping: 'Achats',
      others: 'Autres',
    },
    paymentMethods: {
      cash: 'Espèces',
      card: 'Carte',
      online: 'En ligne',
    },
    // New translations for enhanced UI
    language: 'Langue',
    languageChanged: 'Langue changée avec succès',
    close: 'Fermer',
    expenseDeleted: 'Dépense supprimée avec succès',
    profile: 'Profil',
    uploadProfilePicture: 'Télécharger une photo de profil',
    logout: 'Se déconnecter',
    loginSuccess: 'Connexion réussie ! Redirection...',
    emailRequired: 'L\'email est requis',
    emailInvalid: 'Format d\'email invalide',
    passwordRequired: 'Le mot de passe est requis',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: 'Vous n\'avez pas de compte ?',
    emailInUse: 'Cet email est déjà utilisé.',
    invalidCredentials: 'Identifiants invalides.',
    noData: 'Aucune donnée',
    loading: 'Chargement...',

    // Newly added translations
    expenseTrend: 'Tendance des dépenses', // For the chart section title
    filters: 'Filtres', // For the expansion panel title
    error: 'Erreur', // Generic error message for future use
    success: 'Succès', // Generic success message for future use
    warning: 'Avertissement', // Generic warning message for future use
    Actions:"Actions",
    splitWith:"diviser avec",
    yourShare:"votre part"
  },
};

const i18n = createI18n({
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;