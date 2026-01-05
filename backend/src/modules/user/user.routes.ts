import { Router } from 'express'
import { userController } from './user.controller'
import { authMiddleware, requireStudent, requireParent } from '@/shared/config/passport.config'
import { validateRequest, validateQuery } from '@/shared/middleware/validation.middleware'
import {
  UpdateUserSchema,
  UpdateStudentSchema,
  UpdateParentSchema,
  LinkChildSchema,
  LeaderboardQuerySchema,
  DeleteAccountSchema,
  AddXpSchema,
} from './user.dto'

const router = Router()

// ==================== User Profile Routes ====================

router.get('/profile', authMiddleware, userController.getUserProfile.bind(userController))
router.patch('/profile', authMiddleware, validateRequest(UpdateUserSchema), userController.updateUser.bind(userController))
router.delete('/account', authMiddleware, validateRequest(DeleteAccountSchema), userController.deleteAccount.bind(userController))

// ==================== Student Profile Routes ====================

router.get('/student/profile', authMiddleware, requireStudent, userController.getStudentProfile.bind(userController))
router.patch(
  '/student/profile',
  authMiddleware,
  requireStudent,
  validateRequest(UpdateStudentSchema),
  userController.updateStudentProfile.bind(userController)
)
router.get('/student/statistics', authMiddleware, requireStudent, userController.getStudentStatistics.bind(userController))
router.get('/student/level-progress', authMiddleware, requireStudent, userController.getLevelProgress.bind(userController))
router.post(
  '/student/xp',
  authMiddleware,
  requireStudent,
  validateRequest(AddXpSchema),
  userController.addXp.bind(userController)
)

// ==================== Parent Profile Routes ====================

router.get('/parent/profile', authMiddleware, requireParent, userController.getParentProfile.bind(userController))
router.patch(
  '/parent/profile',
  authMiddleware,
  requireParent,
  validateRequest(UpdateParentSchema),
  userController.updateParentProfile.bind(userController)
)
router.post(
  '/parent/link-child',
  authMiddleware,
  requireParent,
  validateRequest(LinkChildSchema),
  userController.linkChild.bind(userController)
)
router.post(
  '/parent/unlink-child',
  authMiddleware,
  requireParent,
  validateRequest(LinkChildSchema),
  userController.unlinkChild.bind(userController)
)
router.get('/parent/children-progress', authMiddleware, requireParent, userController.getChildrenProgress.bind(userController))

// ==================== Leaderboard Routes ====================

router.get('/leaderboard', validateQuery(LeaderboardQuerySchema), userController.getLeaderboard.bind(userController))

export default router
