# 🚀 Setup Guide - Learning Platform

Complete setup guide for development environment.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **npm 10+** (comes with Node.js)
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Vue Language Features (Volar)
- Tailwind CSS IntelliSense
- Prisma
- Docker

## 🏗️ Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd EduForKids
```

### 2. Start Docker Services

```bash
# Start MySQL + Redis + GUI tools
docker-compose up -d

# Verify containers are running
docker ps
```

You should see 4 containers running:
- `edufor_mysql` (port 3306)
- `edufor_redis` (port 6379)
- `edufor_adminer` (port 8080)
- `edufor_redis_commander` (port 8081)

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (default values work for local dev)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend should now be running on: **http://localhost:3001**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend should now be running on: **http://localhost:3000**

## 🗄️ Database Access

### Adminer (MySQL GUI)

- **URL**: http://localhost:8080
- **System**: MySQL
- **Server**: mysql
- **Username**: root
- **Password**: root123
- **Database**: learning_platform

### Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Opens at: http://localhost:5555

### Redis Commander

- **URL**: http://localhost:8081

## 🧪 Test Accounts

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@learningplatform.com | admin123 |
| **Parent** | parent1@example.com | parent123 |
| **Student** | student1@example.com | student123 |
| **Student** | student2@example.com | student123 |

## 🔧 Troubleshooting

### Port Already in Use

If ports 3306, 6379, 8080, or 8081 are in use:

```bash
# Stop conflicting services
# Windows
net stop mysql80
net stop redis

# Or change ports in docker-compose.yml
```

### Database Connection Error

```bash
# Recreate database
docker-compose down -v
docker-compose up -d
cd backend
npm run migrate
npm run seed
```

### Prisma Generate Error

```bash
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
```

### Frontend Build Error

```bash
cd frontend
rm -rf node_modules .nuxt
npm install
npm run dev
```

## 📝 Development Workflow

### 1. Start Docker

```bash
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Make Changes

- Backend changes auto-reload (nodemon)
- Frontend hot-reloads (Nuxt HMR)

### 5. Run Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🎯 Next Steps

After setup:

1. ✅ Verify all services are running
2. ✅ Login with test accounts
3. ✅ Explore the database in Adminer/Prisma Studio
4. ✅ Check API at http://localhost:3001/api
5. ✅ Read [API.md](./API.md) for endpoint documentation
6. ✅ Read [DATABASE.md](./DATABASE.md) for schema details

## 🐛 Common Issues

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: Docker containers won't start

**Solution:**
```bash
docker-compose down
docker-compose up -d --force-recreate
```

## 📞 Need Help?

- Check [GitHub Issues](https://github.com/your-repo/issues)
- Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- Contact: your.email@example.com

---

**Happy Coding! 🚀**
