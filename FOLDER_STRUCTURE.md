# BizzyQCU Client - Folder Structure

## Overview
This document describes the organized folder structure for the BizzyQCU frontend application, aligned with the 4-subsystem architecture of the backend.

## Structure

```
frontend/
├── public/                      # Static assets
│   └── logo.svg
│
├── src/
│   ├── main.jsx                 # Application entry point with providers
│   ├── App.jsx                  # Root component (now delegates to routes)
│   ├── index.css                # Global styles (Tailwind)
│   │
│   ├── subsystems/              # Feature modules matching backend subsystems
│   │   │
│   │   ├── auth/                # Subsystem 1: Authentication (Felix)
│   │   │   ├── pages/           # Auth-specific pages
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── SellerAuth.jsx
│   │   │   │   └── SellerRegister.jsx
│   │   │   ├── components/      # Auth-specific components (empty for now)
│   │   │   ├── api.js           # Auth API functions
│   │   │   └── index.js         # Barrel export
│   │   │
│   │   ├── marketplace/         # Subsystem 2: Marketplace (Gano, Uy)
│   │   │   ├── pages/           # Marketplace pages (coming soon)
│   │   │   ├── components/      # Marketplace components (coming soon)
│   │   │   └── api.js           # Marketplace API functions
│   │   │
│   │   ├── orders/              # Subsystem 3: Orders & Payments (Canillas, Cabunoc)
│   │   │   ├── pages/           # Order pages (coming soon)
│   │   │   ├── components/      # Order components (coming soon)
│   │   │   └── api.js           # Orders API functions
│   │   │
│   │   └── admin/               # Subsystem 4: Administration (TBA | NO UI/UX YET)
│   │       ├── pages/           # Admin pages (coming soon)
│   │       ├── components/      # Admin components (coming soon)
│   │       └── api.js           # Admin API functions
│   │
│   ├── components/              # Shared UI components across all subsystems
│   │   ├── Footer.jsx
│   │   ├── HeroBackground.jsx
│   │   ├── Logo.jsx
│   │   ├── Navbar.jsx
│   │   └── Placeholder.jsx
│   │
│   ├── layouts/                 # Shared page layouts
│   │   └── Layout.jsx           # Main layout with Navbar + Footer
│   │
│   ├── routes/                  # Application routing
│   │   └── index.jsx            # Centralized route definitions
│   │
│   ├── lib/                     # Shared utilities and configs
│   │   ├── api-client.js        # Axios instance with interceptors
│   │   ├── constants.js         # Shared constants (enums, status codes)
│   │   └── index.js             # Barrel export
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Authentication context & hook
│   │   └── index.js             # Barrel export
│   │
│   └── assets/                  # Images, fonts, icons (empty for now)
│
├── .env                         # Environment variables (VITE_API_BASE_URL)
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies and scripts
```

## Key Principles

### 1. Subsystem Separation
Each subsystem (`auth`, `marketplace`, `orders`, `admin`) mirrors the backend structure and contains:
- **pages/**: Route-level components for that subsystem
- **components/**: Reusable components specific to that subsystem
- **api.js**: API client functions calling the respective backend endpoints

### 2. Shared Resources
- **components/**: UI components used across multiple subsystems (Navbar, Footer, etc.)
- **layouts/**: Page layout wrappers (header, sidebar, etc.)
- **routes/**: Centralized routing configuration
- **lib/**: Shared utilities, API client, and constants
- **hooks/**: Custom React hooks (authentication, data fetching, etc.)

### 3. API Layer
Each subsystem has its own `api.js` file with functions that:
- Import the shared `apiClient` from `lib/api-client.js`
- Call backend endpoints under `/api/v1/{subsystem}`
- Return promises for easy async/await usage
- Handle multipart/form-data for file uploads

### 4. Clean Imports
Barrel exports (`index.js`) allow cleaner imports:
```javascript
// Instead of:
import Home from './subsystems/auth/pages/Home.jsx'
import Login from './subsystems/auth/pages/Login.jsx'

// Use:
import { Home, Login } from './subsystems/auth'
```

## Current Status

### ✅ Completed
- **Subsystem 1 (Auth)**: Pages migrated, API layer complete
- **Shared infrastructure**: API client, constants, auth hook, routing
- All subsystem API layers defined and ready to use

### ⏳ In Progress
- **Subsystem 2 (Marketplace)**: Folder structure ready, pending pages/components
- **Subsystem 3 (Orders)**: Folder structure ready, pending pages/components
- **Subsystem 4 (Admin)**: Folder structure ready, no UI/UX design yet

## Usage Examples

### Making API Calls
```javascript
import { loginWithPassword, getCurrentUser } from '@/subsystems/auth/api'

// In a component
const handleLogin = async (credentials) => {
  try {
    const response = await loginWithPassword(credentials)
    console.log('Logged in:', response)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### Using the Auth Hook
```javascript
import { useAuth } from '@/hooks'

function MyComponent() {
  const { user, isAuthenticated, isSeller, logout } = useAuth()

  if (!isAuthenticated) {
    return <p>Please log in</p>
  }

  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      {isSeller && <p>You are a seller!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Adding a New Page
1. Create the page component in the appropriate subsystem's `pages/` folder
2. Export it from the subsystem's `index.js`
3. Add the route in `src/routes/index.jsx`

Example:
```javascript
// src/subsystems/marketplace/pages/ProductList.jsx
export default function ProductList() {
  return <div>Product List</div>
}

// src/subsystems/marketplace/index.js
export { default as ProductList } from './pages/ProductList.jsx'

// src/routes/index.jsx
import { ProductList } from '../subsystems/marketplace'
// Add route...
<Route path="/products" element={<ProductList />} />
```

## Environment Variables
Create a `.env` file in the root:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Notes
- All paths are absolute from `src/` (configured in Vite if needed)
- Components are `.jsx` for clarity
- API files are `.js` since they don't contain JSX
- Tailwind CSS is configured for styling
