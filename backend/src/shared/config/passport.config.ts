import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Create new user from Google profile
            user = await prisma.user.create({
              data: {
                email,
                password: '',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                googleId: profile.id,
              },
            });

            // Create student profile
            await prisma.student.create({
              data: {
                userId: user.id,
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                dateOfBirth: new Date('2015-01-01'),
                grade: 'GRADE_1',
              },
            });
          } else if (!user.googleId) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
