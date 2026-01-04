import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    // Extend User interface mà Passport sử dụng
    interface User {
      userId: string;
      email: string;
      role: UserRole;
    }

    // Cũng extend Request interface để chắc chắn
    interface Request {
      user?: User;
    }
  }
}

export {};