import { Router } from 'express'
import { userController } from './user.controller'
import { authMiddleware, requireStudent, requireParent, requireAdmin } from '@/shared/config/passport.config'
import { validateRequest, validateQuery } from '@/shared/middleware/validation.middleware'
import {
  UpdateUserSchema,
  UpdateStudentSchema,
  UpdateParentSchema,
  LinkChildSchema,
  LeaderboardQuerySchema,
  DeleteAccountSchema,
  AddXpSchema,
  AdminListUsersQuerySchema,
} from './user.dto'
import {
  ToggleUserActiveSchema,
  ChangeUserRoleSchema,
  AdminDeleteUserSchema,
} from './user.admin.dto'

const router = Router()

// ==================== User Profile Routes ====================
// NOTE: These specific routes MUST come before parametric routes like /:id

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

// ==================== Admin Routes ====================
// NOTE: Parametric routes like /:id must come AFTER all specific routes

router.get(
  '/',
  authMiddleware,
  requireAdmin,
  validateQuery(AdminListUsersQuerySchema),
  userController.getAllUsers.bind(userController)
)

router.get(
  '/:id',
  authMiddleware,
  requireAdmin,
  userController.getUserById.bind(userController)
)

router.patch(
  '/:id/toggle-active',
  authMiddleware,
  requireAdmin,
  validateRequest(ToggleUserActiveSchema),
  userController.toggleUserActive.bind(userController)
)

router.patch(
  '/:id/change-role',
  authMiddleware,
  requireAdmin,
  validateRequest(ChangeUserRoleSchema),
  userController.changeUserRole.bind(userController)
)

router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateRequest(AdminDeleteUserSchema),
  userController.adminDeleteUser.bind(userController)
)

export default router
