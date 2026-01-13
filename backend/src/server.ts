import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './shared/config/google-passport.config';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import courseRoutes from './modules/course/course.routes';
import lectureRoutes from './modules/lecture/lecture.routes';
import progressRoutes from './modules/progress/progress.routes';
import recommendationRoutes from './modules/recommendation/recommendation.routes';
import monitoringRoutes from './modules/monitoring/monitoring.routes';
import rewardRoutes from './modules/reward/reward.routes';
import { logger } from './shared/utils/logger.utils'
import { createServer } from 'http';
import { websocketService } from './shared/services/websocket.service';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket support
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration for passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use(`${process.env.API_PREFIX || '/api'}/auth`, authRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/users`, userRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/courses`, courseRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/lectures`, lectureRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/progress`, progressRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/recommendations`, recommendationRoutes);
app.use(`${process.env.API_PREFIX || '/api'}/monitoring`, monitoringRoutes);
app.use(`${process.env.API_PREFIX || '/api'}`, rewardRoutes);

// Custom error interface
interface CustomError extends Error {
    status?: number;
}

// Error handling
app.use((err: CustomError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Initialize WebSocket service
websocketService.initialize(httpServer);

// Start server
httpServer.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`API docs: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    logger.info(`WebSocket: ws://localhost:${PORT}/ws`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;