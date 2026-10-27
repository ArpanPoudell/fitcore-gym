# 🏋️ Fitcore Gym — Gym Management System

A modern web-based gym management platform designed to simplify membership administration, attendance tracking, payment records, and member engagement.

Fitcore Gym provides dedicated interfaces for administrators and gym members, bringing essential gym operations together in a single application.

## ✨ Key Features

### 👤 Authentication & User Management
- User registration and login.
- Session management.
- Separate administrator and member experiences.
- Member profile management.

### 📊 Admin Dashboard
- Overview of gym membership and activity.
- Member statistics and membership information.
- Revenue and member-growth visualizations.
- Membership expiry monitoring.
- Access to gym management features.

### 💪 Member Dashboard
- View membership information and status.
- Track gym attendance.
- Monitor attendance streaks.
- View payment records.
- Access personal profile information and notifications.

### 💳 Payment Management
- Payment-related interface and record management.
- Demo payment flow for demonstrating the payment experience.
- **Payment status:** Only demo payments are currently implemented. Real payment gateway integration and live financial transactions are not supported yet.

### 🎨 User Interface
- Modern, responsive design.
- Reusable UI components.
- Dashboard-oriented layouts.
- Interactive charts and visualizations.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend user interface |
| TypeScript | Type-safe development |
| Vite | Development server and production build |
| Tailwind CSS | Styling and responsive design |
| shadcn/ui | Reusable UI components |
| Radix UI | Accessible UI primitives |
| React Router | Client-side navigation |
| Supabase | Authentication and backend/database services |
| TanStack Query | Server-state and data-fetching management |
| Recharts | Charts and data visualization |
| Vitest | Automated testing |

## 🏗️ Application Architecture

Fitcore Gym follows a frontend-driven architecture in which the React application communicates with Supabase for supported authentication and database operations.

```text
                  ┌────────────────────────┐
                  │        Users           │
                  │  Admins and Members    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     React Frontend      │
                  │   TypeScript + Vite     │
                  └───────────┬────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ Authentication│ │ Dashboards  │ │ UI & Charts │
       │ & User Access │ │ Admin/Member│ │ Components  │
       └─────────────┘ └─────────────┘ └─────────────┘
               │              │
               └──────────────┤
                              ▼
                  ┌────────────────────────┐
                  │        Supabase        │
                  │ Authentication & Data  │
                  └────────────────────────┘
```

**Architecture overview:**
- **Presentation layer:** React, TypeScript, Tailwind CSS, and reusable components.
- **Navigation layer:** React Router manages application routes.
- **Data-fetching layer:** TanStack Query manages server-state operations.
- **Backend services:** Supabase provides the configured authentication and database services.
- **Visualization layer:** Recharts supports dashboard analytics.

The application does not require a separate Express server for the architecture described above. Payment processing currently uses a demo flow rather than a live payment gateway.

## 📁 Project Structure

```text
fitcore-gym/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── integrations/
│   │   └── supabase/        # Supabase client integration
│   ├── pages/               # Application pages
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and shared logic
│   ├── App.tsx              # Application routes and structure
│   └── main.tsx             # Application entry point
├── supabase/
│   ├── migrations/          # Database migration files
│   └── config.toml          # Supabase configuration
├── package.json             # Dependencies and npm scripts
├── package-lock.json        # Dependency lockfile
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Testing configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ArpanPoudell/fitcore-gym.git
```

### 2. Navigate to the project directory

```bash
cd fitcore-gym
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Add the environment variables required by the Supabase client and other configured integrations. Use the exact variable names expected by the source code.

For example, a typical Supabase client configuration may use:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Important:** These names are examples. Confirm the actual names in the project's configuration before running the application.

Never commit your `.env` file, private credentials, or service-role keys to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open the local address printed in the terminal to access the application.

## 📜 Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run build:dev` | Create a development-mode build |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run the Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview the production build |

## 💰 Payment Implementation Status

Fitcore Gym currently includes a **demo payment flow** to demonstrate the payment-related user experience.

| Capability | Status |
|---|---|
| Payment interface | Implemented |
| Demo payment flow | Implemented |
| Live payment gateway | Not implemented |
| Real-money transactions | Not supported |
| Production payment verification | Not implemented |

A production payment system would require integrating a suitable payment provider, securely verifying transactions on the backend, and handling payment success, failure, and reconciliation.

## 🔐 Security Considerations

- Keep environment variables and credentials out of version control.
- Use appropriate database access policies.
- Enforce authorization for administrator-only operations.
- Do not rely solely on frontend role checks to protect sensitive data.
- Keep private service-role credentials out of browser-accessible code.
- Use verified backend payment processing before introducing real-money transactions.

## 🔮 Future Enhancements

Potential improvements include:

- Integration with a real payment gateway.
- Automated membership renewal and expiry notifications.
- Advanced attendance and membership analytics.
- Workout planning and progress tracking.
- Enhanced administrative reporting.
- Improved production deployment and security controls.

## 👨‍💻 Developer

**Arpan Poudel**

Computer Science and Engineering

GitHub: ArpanPoudell

---

*Fitcore Gym — Simplifying gym management through technology.*
