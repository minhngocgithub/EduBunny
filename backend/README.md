# Backend API - Learning Platform

Node.js + Express + TypeScript + Prisma + MySQL + Redis

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (for MySQL & Redis)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start Docker services**
```bash
# From root directory
cd ..
docker-compose up -d
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Run migrations**
```bash
npm run migrate
```

5. **Seed database**
```bash
npm run seed
```

6. **Start development server**
```bash
npm run dev
```

Server runs on: http://localhost:3001

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── auth/
│   │   ├── user/
│   │   ├── course/
│   │   └── ...
│   ├── shared/           # Shared code
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── tests/                # Tests
```

## 🗄️ Database Access

**Adminer (MySQL GUI):**
- URL: http://localhost:8080
- Server: mysql
- Username: root
- Password: root123
- Database: learning_platform

**Prisma Studio:**
```bash
npm run prisma:studio
```

**Redis Commander:**
- URL: http://localhost:8081

## 📝 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run migrations (dev)
npm run migrate:prod # Run migrations (production)
npm run seed         # Seed database
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🔐 Environment Variables

See `.env.example` for all available variables.

Key variables:
- `DATABASE_URL`: MySQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis config
- `JWT_SECRET`: JWT signing secret
- `GEMINI_API_KEY`: Google Gemini API key

## 📚 API Documentation

API endpoints will be documented using Swagger/OpenAPI.

Base URL: `http://localhost:3001/api`

## 🚢 Deployment

Deploy to Railway:
1. Connect GitHub repository
2. Add environment variables
3. Railway auto-deploys on push to main

## 📄 License

MIT
