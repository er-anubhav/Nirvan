# Nirvana Frontend

The frontend for Nirvan is built with React, TypeScript, and Vite, offering a modern, responsive interface for citizens and officials to interact with the platform.

## 🌟 What Makes Our Frontend Exceptional

- **Lightning-Fast Performance**: Built on Vite for near-instant hot module replacement
- **Beautiful Component Library**: Leveraging shadcn/ui for a cohesive design system
- **Advanced Mapping Capabilities**: Interactive Leaflet maps for visualizing civic issues
- **Real-Time Updates**: Live data synchronization with Supabase
- **Fully Responsive Design**: Optimized for all devices from mobile to desktop
- **Accessibility-First Approach**: WCAG-compliant components and interfaces

## ⚙️ Technologies Used

- React 18 with TypeScript
- Vite build system
- Tailwind CSS for styling
- shadcn/ui component library
- Leaflet for interactive maps
- Supabase for data and authentication
- React Router for navigation
- React Query for data fetching
- React Hook Form for form handling

## 📋 Installation

### Prerequisites

- Node.js v18+ and npm
- Bun (optional but recommended for faster installation)

### Setup Steps

1. **Install dependencies**

```bash
# Using npm
npm install

# OR using Bun (faster)
bun install
```

2. **Configure environment variables**

Create a `.env` file in the root of the frontend directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000  # Backend API URL
```

3. **Start the development server**

```bash
# Using npm
npm run dev

# OR using Bun
bun run dev
```

The application will be available at http://localhost:5173

4. **Build for production**

```bash
# Using npm
npm run build

# OR using Bun
bun run build
```

The build output will be in the `dist` directory, ready for deployment.

## 📂 Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
    - `common/` - Layout and shared components
    - `map/` - Leaflet map components
    - `ui/` - shadcn/ui components
  - `hooks/` - Custom React hooks
  - `integrations/` - Third-party service integrations
  - `lib/` - Utility functions and configurations
  - `pages/` - Application pages and routes
  - `types/` - TypeScript type definitions

## 🔄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build with development settings
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 🧩 Key Features

- **Interactive Complaint Maps**: Visualize issues across neighborhoods
- **Real-Time Dashboards**: Monitor complaint status and trends
- **Multi-Role Access**: Interfaces for citizens, officials, and administrators
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark/Light Modes**: Optimized viewing experience in any environment

## 🤝 Contributing

Please refer to the main project README for contribution guidelines.

---

Built by **Team Vercel** to create real change, one complaint at a time.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
