# Chat Platform

A modern React application built with the latest technologies and best practices.

## 🚀 Technology Stack

- **React 18** - UI Library with TypeScript
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management
- **TanStack Query** - Server state management and data fetching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible component library
- **Lucide React** - Icon library

## 📦 Features

- ⚡ **Fast Development** - Vite for lightning-fast HMR
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components
- 🔄 **State Management** - Redux Toolkit for client state
- 🌐 **Data Fetching** - TanStack Query for server state
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **TypeScript** - Full type safety
- 🎨 **Dark Mode Ready** - Built-in theme support

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd chat-platform
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── components/
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── store/                  # Redux store and slices
│   ├── hooks.ts           # Typed Redux hooks
│   ├── index.ts           # Store configuration
│   └── slices/            # Redux slices
└── main.tsx               # Application entry point
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses Tailwind CSS with a custom design system based on shadcn/ui. The color scheme supports both light and dark modes.

### Key Features:

- CSS variables for theming
- Responsive design utilities
- Component variants with class-variance-authority
- Tailwind merge for conditional classes

## 🔄 State Management

### Redux Toolkit

- Centralized state management
- Type-safe actions and reducers
- DevTools integration
- Example counter slice included

### TanStack Query

- Server state management
- Automatic caching and synchronization
- Background refetching
- Optimistic updates support

## 🧩 Components

The project includes pre-configured shadcn/ui components:

- Button with multiple variants
- Card components
- Utility functions for class merging

## 🚀 Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## 📝 License

This project is licensed under the MIT License.
