# Stock Master

A modern inventory and warehouse management web app built with React + Vite + TypeScript. It includes authentication, dashboard analytics, products, receipts, deliveries, transfers, adjustments, a transaction ledger, notifications, and settings for warehouse management.

## Features
- **Authentication**: Login, forgot password, OTP verification, and password reset flows
- **Dashboard**: Overview and analytics
- **Products**: List, add, and detailed product views
- **Receipts**: Create and manage inbound receipts
- **Deliveries**: Create and manage outbound deliveries
- **Transfers**: Move stock between locations
- **Adjustments**: Record inventory adjustments
- **Ledger**: Transaction history and audit trail
- **Notifications**: In-app notifications
- **Settings**: Warehouse management and configuration

## Tech Stack
- **Client**: React 18, TypeScript, Vite
- **Routing**: react-router-dom
- **UI**: Radix UI primitives, shadcn-style patterns, lucide-react icons
- **UX**: sonner toasts, embla carousel, recharts
- **State/Context**: React Context Providers (Auth, Inventory)
- **Styling**: Utility-first CSS (see `src/index.css`)

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- npm (comes with Node)

### Installation
```bash
npm install
```

### Run in development
```bash
npm run dev
```

### Build for production
```bash
npm run build
```
The production build is emitted to the `build/` directory. Serve it with any static file server or your hosting of choice.

## Project Structure
```
.
├─ index.html
├─ vite.config.ts
├─ package.json
├─ src/
│  ├─ main.tsx            # App entry
│  ├─ App.tsx             # Routes and layout
│  ├─ components/         # UI and layout components
│  ├─ screens/            # Feature screens (dashboard, products, receipts, etc.)
│  ├─ contexts/           # Auth and inventory providers
│  ├─ lib/                # Utilities and helpers
│  ├─ styles/             # Global styles
│  ├─ types/              # TypeScript types
│  └─ index.css           # Global CSS
├─ public/                # Static assets
└─ functions/             # Optional serverless functions (Node + TS)
```

## Key Scripts
- **`dev`**: Start the Vite dev server
- **`build`**: Build the client for production

## Configuration
- Environment-specific settings can be provided via standard `.env` files.

<img width="1600" height="793" alt="image" src="https://github.com/user-attachments/assets/f6e02e48-a92b-4205-a8e0-918c632fcccb" />
<img width="1905" height="798" alt="image" src="https://github.com/user-attachments/assets/a63e693e-a5a7-4277-bc26-8a96344e1b60" />
<img width="1628" height="907" alt="image" src="https://github.com/user-attachments/assets/bb0d5d83-4fa0-4827-bae4-ad8e2055bef2" />

