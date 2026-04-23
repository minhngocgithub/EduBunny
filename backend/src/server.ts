import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

import './shared/config/google-passport.config';
import { logger } from './shared/utils/logger.utils';
import { redisService } from './shared/services/redis.service';
import { websocketService } from './shared/services/websocket.service';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import courseRoutes from './modules/course/course.routes';
import lectureRoutes from './modules/lecture/lecture.routes';
import progressRoutes from './modules/progress/progress.routes';
import recommendationRoutes from './modules/recommendation/recommendation.routes';
import monitoringRoutes from './modules/monitoring/monitoring.routes';
import rewardRoutes from './modules/reward/reward.routes';
import achievementRoutes from './modules/achievement/achievement.routes';
import youtubeRoutes from './modules/youtube/youtube.routes';
import adminRoutes from './modules/admin/admin.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import paymentRoutes from './modules/payment/payment.routes';
import { paymentService } from './modules/payment/payment.service';

const app = express();
const PORT = process.env.PORT || 3001;
const API = process.env.API_PREFIX || '/api';
const uploadsDir = path.resolve(process.cwd(), 'uploads');

const httpServer = createServer(app);

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: 'cross-origin',
    },
}));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

app.use(passport.initialize());

app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/courses`, courseRoutes);
app.use(`${API}/lectures`, lectureRoutes);
app.use(`${API}/progress`, progressRoutes);
app.use(`${API}/recommendations`, recommendationRoutes);
app.use(`${API}/monitoring`, monitoringRoutes);
app.use(`${API}`, rewardRoutes);
app.use(`${API}`, achievementRoutes);
app.use(`${API}/youtube`, youtubeRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/leaderboard`, leaderboardRoutes);
app.use(`${API}/quizzes`, quizRoutes);
app.use(`${API}/payments`, paymentRoutes);

interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const shutdown = async (signal: string) => {
    logger.info(`${signal} received: closing HTTP server`);
    paymentService.stopReconciliationScheduler();
    paymentService.stopLifecycleScheduler();
    httpServer.close(async () => {
        await redisService.disconnect();
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        logger.error('Server error:', err);
        process.exit(1);
    }
});

const start = async () => {
    try {
        await redisService.connect();
        websocketService.initialize(httpServer);
        paymentService.startReconciliationScheduler();
        paymentService.startLifecycleScheduler();
        httpServer.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
            logger.info(`API: http://localhost:${PORT}${API}`);
            logger.info(`WebSocket: ws://localhost:${PORT}/ws`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();

export default app;