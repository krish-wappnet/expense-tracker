# Expense Tracker

A modern, responsive web application built with Vue 3, TypeScript, and Vite, designed to help users manage their expenses efficiently. The app allows users to add, edit, delete, and filter expenses, visualize spending patterns with charts, and export/import data for portability. It features a clean UI with dark mode support and is optimized for both desktop and mobile devices.

## Features

### Add, Edit, and Delete Expenses:
- Add new expenses with details like title, amount, date, category, and payment method.
- Edit existing expenses using a form dialog.
- Delete expenses with a confirmation dialog for safety.

### Expense Filtering:
- Filter expenses by date range using a collapsible date range picker.
- Filter expenses by category and search by title within the expense list.

### Summary Dashboard:
- View a summary of total expenses, total amount spent, and average amount per expense.
- Visualize category-wise spending with a pie chart in the summary section.

### Expense Visualization:
- View spending patterns with two switchable charts:
  - **Pie Chart:** Shows category-wise spending (e.g., Food, Travel).
  - **Bar Chart:** Shows spending by payment method (e.g., Cash, Card, Online).

### Data Management:
- Clear all expenses with a confirmation dialog.
- Export expenses to a JSON file for backup.
- Import expenses from a JSON file to restore data.

### Dark Mode:
- Toggle between light and dark themes for better accessibility and user experience.

### Responsive Design:
- Fully responsive layout that adapts to different screen sizes (desktop, tablet, mobile).
- Collapsible date range filter to save space on smaller screens.
- Stacked layout for expense list and chart on mobile devices.

### Data Persistence:
- Expenses are saved to **localStorage** to persist data between sessions.

## Technologies Used
- **Vue 3**: A progressive JavaScript framework for building user interfaces.
- **TypeScript**: Adds static types to JavaScript for better code reliability and maintainability.
- **Vite**: A fast build tool and development server for modern web projects.
- **Vuetify**: A Material Design component framework for Vue, used for UI components and responsive layout.
- **Pinia**: A state management library for Vue, used to manage expenses data.
- **Chart.js** with `vue-chartjs`: For rendering pie and bar charts to visualize spending data.
- **ESLint**: For linting and maintaining code quality.
- **localStorage**: For persisting expense data in the browser.

## Recommended IDE Setup
- **VSCode** with the **Volar** extension (and disable Vetur if installed).
- Volar provides TypeScript support for `.vue` files, enabling full type checking with `vue-tsc`.

## Project Setup

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installation

Clone the repository:

```sh
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
Install dependencies:

sh
Copy
Edit
npm install
Compile and Hot-Reload for Development
Run the development server with hot-reloading:

sh
Copy
Edit
npm run dev
Open http://localhost:5173 in your browser to view the app.

Type-Check, Compile, and Minify for Production
Build the app for production:

sh
Copy
Edit
npm run build
This will generate a dist folder with the production-ready files.

Lint with ESLint
Run the linter to check for code quality issues:

sh
Copy
Edit
npm run lint
Usage
Add an Expense:
Click the "Add Expense" button in the header.

Fill out the form with the expense details (title, amount, date, category, payment method).

Submit the form to add the expense to the list.

Edit an Expense:
In the expense list, click the pencil icon next to an expense.

Update the details in the form and submit.

Delete an Expense:
In the expense list, click the trash icon next to an expense.

Confirm the deletion in the dialog.

Filter Expenses:
Use the date range filter to filter expenses by date.

In the expense list, filter by category or search by title.

Visualize Spending:
View the summary pie chart for category-wise spending.

Switch between the pie chart (category spending) and bar chart (payment method spending) in the main chart section.

Manage Data:
Click "Clear All Data" to remove all expenses (with confirmation).

Click "Export" to download expenses as a JSON file.

Click "Import" to upload a JSON file and restore expenses.

Toggle Dark Mode:
Use the "Dark Mode" switch in the header to toggle between light and dark themes.

Deployment
To deploy the app to a hosting service like Netlify, Vercel, or GitHub Pages:

Build the app:
sh
Copy
Edit
npm run build
Deploy the dist folder to your hosting service:
Netlify:
Drag and drop the dist folder into Netlify’s web interface, or use the CLI:

sh
Copy
Edit
npm install -g netlify-cli
netlify deploy --prod --dir=dist
Vercel:
Use the Vercel CLI:

sh
Copy
Edit
npm install -g vercel
vercel --prod
GitHub Pages:
Configure vite.config.ts with the correct base path and deploy:

sh
Copy
Edit
npm run build
npm run deploy
Future Improvements
Backend Integration: Replace localStorage with a backend API (e.g., Firebase, Supabase) for cloud storage, user authentication, and multi-device support.

Spending Over Time Chart: Add a line chart to the ExpenseChart component to visualize spending trends over time (e.g., by month).

Category Filter on Dashboard: Add a category filter directly on the dashboard for easier filtering.

Currency Formatting: Use Intl.NumberFormat for better currency formatting (e.g., ₹1,234.56).

Notifications: Add toast notifications for actions like adding, editing, or deleting expenses.

Unit Tests: Add unit tests using Vitest or Jest to ensure reliability.