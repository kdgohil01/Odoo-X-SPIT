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
The dev server starts on http://localhost:3000 and opens automatically.

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
- Environment-specific settings can be provided via standard `.env` files supported by Vite. Create `.env` or `.env.local` at the project root as needed.

## Contributing
- Fork the repo and create a feature branch
- Commit with clear messages
- Open a Pull Request describing your changes

## License
Specify your license here (e.g., MIT). If omitted, all rights are reserved by default.
