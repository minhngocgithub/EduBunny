# Phase 1 Testing Checklist

Scope follows tests/Testing_Flow.md order: utils -> middleware -> auth -> reward.

## Foundation
- [x] Jest test config and test tsconfig aligned for jest globals
- [x] Quiz baseline tests passing in branch (unit + dto integration)

## Phase 1.1 Utils
- [x] jwt.utils: generateAccessToken, verifyToken, verifyRefreshToken, decodeToken
- [x] response.utils: successResponse, errorResponse, paginatedResponse

## Phase 1.2 Middleware
- [x] authMiddleware: bearer/cookie valid and invalid paths
- [x] optionalAuthMiddleware: optional user hydration
- [x] requireRole: auth required, deny, allow

## Phase 1.3 Auth Service
- [ ] register/login/refresh/forgot/reset core paths

## Phase 1.4 Reward Service
- [ ] XP, level-up, streak flow

## Commit Plan
1. chore(test): add phase-1 checklist baseline
2. test(unit): add jwt/response utils tests
3. test(unit): add auth middleware role guard tests
4. test(unit): extend auth service tests to workflow matrix
5. test(unit): add reward service core behavior tests
