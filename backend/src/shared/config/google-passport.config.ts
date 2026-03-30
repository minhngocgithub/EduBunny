import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient, UserRole, Grade } from '@prisma/client'

const prisma = new PrismaClient()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3001/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const firstName = profile.name?.givenName || ''
        const lastName = profile.name?.familyName || ''
        const avatar = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined)
        }

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              password: '',
              role: UserRole.STUDENT,
              emailVerified: true,
              googleId: profile.id,
              student: {
                create: {
                  firstName,
                  lastName,
                  dateOfBirth: new Date('2010-01-01'),
                  grade: Grade.GRADE_1,
                  avatar,
                },
              },
            },
          })
        } else {
          if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: true },
            })
          }
        }

        const expressUser: Express.User = {
          userId: user.id,
          email: user.email,
          role: user.role,
        }

        return done(null, expressUser)
      } catch (error) {
        return done(error as Error, undefined)
      }
    }
  )
)

export default passport
