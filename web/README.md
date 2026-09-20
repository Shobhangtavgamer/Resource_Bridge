# Resource Bridge - Web Application

A React-based web application for connecting donors with NGOs to facilitate item donations.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 6
- **State Management**: Zustand 5
- **Icons**: Lucide React
- **Fonts**: Fontsource (Inter, Fraunces, Exo 2, Black Ops One)

## Project Structure

```
web/
├── public/                 # Static assets (images, favicon)
│   ├── books.jpg
│   ├── clothes.avif
│   ├── householditems.jpg
│   ├── stationery items.jpg
│   └── toys.jpg
├── src/
│   ├── api/               # API client & types
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── illustrations/ # Category images component
│   │   ├── layout/        # Layout components (Navbar, Footer, Container, etc.)
│   │   ├── motion/        # Animation components
│   │   ├── ngo/           # NGO-specific components
│   │   ├── profile/       # Profile components
│   │   ├── routes/        # Route protection components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities, constants, routes config
│   ├── pages/             # Page components
│   │   ├── auth/          # Login, Register
│   │   ├── donor/         # Donor dashboard & pages
│   │   ├── ngo/           # NGO dashboard & pages
│   │   └── admin/         # Admin pages
│   ├── store/             # Zustand stores
│   ├── index.css          # Global styles + Tailwind imports
│   ├── main.tsx           # App entry point
│   └── router.tsx         # Route definitions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

## Features

- **Donation Categories**: Books, Clothes, Toys, Educational Materials, Household Items (with real images)
- **User Roles**: Donor, NGO, Admin
- **Authentication**: Login/Register flows
- **Donation Management**: Create, view, track donations
- **NGO Dashboard**: Pickups, distributions, available donations
- **Admin Panel**: User management, NGO verification, reviews
- **Responsive Design**: Mobile-first with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Produces production build in `dist/`

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run typecheck
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3000/api
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

## Category Images

Category illustrations use real photos from `public/`:
- `/books.jpg` - Books
- `/clothes.avif` - Clothes
- `/toys.jpg` - Toys
- `/stationery items.jpg` - Educational Materials
- `/householditems.jpg` - Household Items

## License

Private - Resource Bridge Project