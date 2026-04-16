# Learning Platform for Kids (Grades 1-5)

> An interactive educational platform designed specifically for elementary school children

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **AI**: Google Gemini API

### Frontend
- **Framework**: Nuxt 4
- **Language**: TypeScript
- **UI**: Vue 3 + Tailwind CSS
- **State**: Pinia
- **Routing**: File-based

### DevOps
- **Local Dev**: Docker (MySQL + Redis only)
- **Backend Deploy**: Railway
- **Frontend Deploy**: Vercel
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 20+
- npm or pnpm
- Docker Desktop
- Git

## 🛠️ Quick Start

### 1. Clone repository
```bash
git clone <repository-url>
cd EduForKids
```

### 2. Start Docker services
```bash
docker-compose up -d
```

This starts:
- MySQL (port 3306)
- Redis (port 6379)
- Adminer (port 8080) - MySQL GUI
- Redis Commander (port 8081) - Redis GUI

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Backend runs on: http://localhost:3001

### 4. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on: http://localhost:3000

## Project Structure

```
EduForKids/
├── backend/          # Express.js API
├── frontend/         # Nuxt 4 Application
├── docs/            # Documentation
├── docker-compose.yml
└── README.md
```

## Database Access

- **Adminer**: http://localhost:8080
  - System: MySQL
  - Server: mysql
  - Username: root
  - Password: root123
  - Database: learning_platform

- **Redis Commander**: http://localhost:8081

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Testing

### Backend
```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:coverage # Coverage report
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

- **Backend**: Railway (automatic from main branch)
- **Frontend**: Vercel (automatic from main branch)

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) file

## Author

Your Name - your.email@example.com

## Links

- [Live Demo](https://your-app.vercel.app)
- [API Documentation](https://your-backend.railway.app/api-docs)
- [GitHub Repository](https://github.com/your-username/learning-platform)
