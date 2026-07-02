# Event Customer Check-In Dashboard

A comprehensive ReactJS web application built to manage event customer check-ins, QR code verification, booth assignments, and track operational customer status.

## 🌟 Project Overview

This dashboard serves as the central hub for event management staff to process attendees. The core features include:
- **Authentication & Dashboard**: Secure login with JWT tokens and a real-time summary dashboard featuring a status distribution chart.
- **Customer CRUD Management**: A directory to add, edit, delete, search, and filter event customers.
- **QR Code Verification**: A built-in QR scanner to verify attendee tickets and check them into the event instantly.
- **Booth Assignment**: An interface for sales managers to assign available booths to checked-in customers.
- **Status Updates**: A chronological logging system to track customer progress (Waiting -> Assigned -> In Discussion -> Completed) with follow-up remarks.

## 🚀 Setup Instructions

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd checkiin-dashboard-latest
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. *Optional*: To test the highly optimized production build and view true Lighthouse performance scores:
   ```bash
   npm run build
   npm run preview
   ```

### Running Unit Tests
This project includes comprehensive Redux unit tests using Vitest.
```bash
npm run test
```

## 🔐 Login Credentials

To access the dashboard, you can use the default demo credentials:
- **Email:** `admin@example.com` (or any valid email format)
- **Password:** `password` (or any string > 4 characters)

## 📡 API Details

The application uses an Axios API service layer (mocked/integrated depending on your backend). The core endpoints are:

### Auth
- `POST /api/login` - Authenticates user and returns JWT token

### Dashboard
- `GET /api/dashboard-summary` - Returns summary metrics and status distribution data

### Customers
- `GET /api/customers` - Fetches the customer directory (supports `?search=` and `?status=` queries)
- `POST /api/customers` - Creates a new customer
- `GET /api/customers/:id` - Fetches customer details
- `PUT /api/customers/:id` - Updates customer details
- `DELETE /api/customers/:id` - Removes a customer

### QR Code & Check-In
- `GET /api/qr-codes/verify/:qrCode` - Validates a scanned QR code
- `POST /api/customers/check-in` - Checks in a verified customer

### Booth Assignment
- `GET /api/booth-assignments` - Fetches all available booths and active assignments
- `POST /api/booth-assignments` - Assigns a customer to a booth
- `PUT /api/booth-assignments/:id` - Updates an assignment
- `DELETE /api/booth-assignments/:id` - Cancels an assignment

### Customer Status
- `GET /api/customer-status/:customerId` - Fetches the chronological history log for a customer
- `POST /api/customer-status` - Pushes a new status update and remark

## 🛠 Third-Party Libraries Used

This project adheres strictly to the assignment requirements and utilizes the following major libraries:

1. **[html5-qrcode](https://github.com/mebjas/html5-qrcode)**: Provides the robust QR code scanning engine for the check-in page.
2. **[recharts](https://recharts.org/)**: Renders the responsive status distribution Pie Chart on the dashboard.
3. **[react-toastify](https://fkhadra.github.io/react-toastify/)**: Handles all global success and error notifications across the app.
4. **[@mui/material (Material UI)](https://mui.com/)**: Serves as the core component library for responsive layouts, cards, inputs, and tables.
5. **[react-hook-form](https://react-hook-form.com/)**: Manages complex form state and validation effortlessly.
6. **[@reduxjs/toolkit](https://redux-toolkit.js.org/)**: Manages global application state, handling complex asynchronous API thunks and data caching.
7. **[vitest](https://vitest.dev/)**: Fast, Vite-native unit testing framework used for ensuring Redux logic integrity.

## 📸 Screenshots

*(Replace the paths below with actual screenshots of your deployed app)*

- **Dashboard:** `![Dashboard Screenshot](./screenshots/dashboard.png)`
- **Customer List:** `![Customer List](./screenshots/customer-list.png)`
- **QR Scanner:** `![QR Scanner](./screenshots/qr-scanner.png)`
- **Booth Assignment:** `![Booth Assignment](./screenshots/booths.png)`
