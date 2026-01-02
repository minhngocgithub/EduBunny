# Frontend - Learning Platform

Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start development server**
```bash
npm run dev
```

Application runs on: http://localhost:3000

## 📁 Project Structure

```
frontend/
├── assets/           # Static assets (CSS, images)
├── components/       # Vue components
├── composables/      # Composition functions
├── layouts/          # App layouts
├── middleware/       # Route middleware
├── pages/            # File-based routing
├── plugins/          # Nuxt plugins
├── public/           # Public static files
├── stores/           # Pinia stores
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## 🎨 Tech Stack

- **Framework**: Nuxt 4
- **UI**: Vue 3 + Composition API
- **Styling**: Tailwind CSS
- **State**: Pinia
- **HTTP**: Built-in fetch
- **Routing**: File-based
- **TypeScript**: Full type safety

## 📝 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run generate     # Generate static site
npm run lint         # Lint code
npm run format       # Format code
npm run typecheck    # Type checking
```

## 🔌 API Integration

API base URL configured in `.env`:
```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 🎨 Styling

Tailwind CSS with custom theme:
- Primary colors
- Custom animations
- Reusable components

## 🚢 Deployment

Deploy to Vercel:
1. Connect GitHub repository
2. Framework: Nuxt.js
3. Add environment variables
4. Deploy!

## 📄 License

MIT
