export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      logger.info(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      logger.warn(`[WARN] ${message}`, ...args);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};