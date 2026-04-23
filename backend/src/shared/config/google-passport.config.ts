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
        const googleId = typeof profile.id === 'string' ? profile.id.trim() : ''
        const firstName = profile.name?.givenName || ''
        const lastName = profile.name?.familyName || ''
        const avatar = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined)
        }

        if (!googleId) {
          return done(new Error('Google profile ID is missing'), undefined)
        }

        const normalizedEmail = email.trim().toLowerCase()

        const [userByGoogleId, userByEmail] = await Promise.all([
          prisma.user.findFirst({ where: { googleId } }),
          prisma.user.findUnique({ where: { email: normalizedEmail } }),
        ])

        if (userByGoogleId && userByEmail && userByGoogleId.id !== userByEmail.id) {
          return done(
            new Error('Google account is already linked to another user'),
            undefined
          )
        }

        let user = userByGoogleId || userByEmail

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              password: '',
              role: UserRole.STUDENT,
              emailVerified: true,
              googleId,
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
          const updateData: {
            emailVerified?: boolean
            googleId?: string
          } = {}

          if (!user.emailVerified) {
            updateData.emailVerified = true
          }

          if (!user.googleId) {
            updateData.googleId = googleId
          }

          if (Object.keys(updateData).length > 0) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: updateData,
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
        console.error('Google Strategy verify callback failed:', error)
        return done(error as Error, undefined)
      }
    }
  )
)

export default passport
