# 📊 Database Schema - Learning Platform

Complete database schema documentation.

## 📐 Schema Overview

15 tables organized into logical groups:

1. **User & Auth** (3 tables)
2. **Student Profile** (2 tables)
3. **Course Management** (2 tables)
4. **Learning Progress** (2 tables)
5. **Assessments** (4 tables)
6. **Gamification** (2 tables)
7. **AI Chatbot** (2 tables)

## 🔐 User & Authentication

### users
Main user accounts table.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email |
| password | String | Hashed password |
| role | Enum | STUDENT, PARENT, ADMIN |
| isActive | Boolean | Account status |
| emailVerified | Boolean | Email verification |
| lastLoginAt | DateTime | Last login time |
| createdAt | DateTime | Account creation |
| updatedAt | DateTime | Last update |

**Relations:**
- 1:1 → Student
- 1:1 → Parent
- 1:N → RefreshToken
- 1:N → ChatSession

### refresh_tokens
JWT refresh tokens for session management.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| token | String | Unique token |
| userId | UUID | FK to users |
| expiresAt | DateTime | Expiration time |
| createdAt | DateTime | Creation time |

## 👤 Student & Parent

### students
Student profiles with gamification data.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK to users |
| firstName | String | First name |
| lastName | String | Last name |
| dateOfBirth | DateTime | Birth date |
| grade | Enum | GRADE_1 to GRADE_5 |
| avatar | String | Avatar URL |
| bio | Text | Biography |
| xp | Int | Experience points |
| level | Int | Current level |
| stars | Int | Stars collected |
| streak | Int | Learning streak days |
| lastActiveDate | DateTime | Last active date |
| parentId | UUID | FK to parents (optional) |

**Relations:**
- N:1 → User
- N:1 → Parent (optional)
- 1:N → Enrollment
- 1:N → Progress
- 1:N → QuizAttempt
- 1:N → GameScore
- N:N → Achievement

### parents
Parent accounts linked to students.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK to users |
| firstName | String | First name |
| lastName | String | Last name |
| phone | String | Phone number |

**Relations:**
- 1:1 → User
- 1:N → Student

## 📚 Courses & Lectures

### courses
Course catalog.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Course title |
| slug | String | URL slug |
| description | Text | Description |
| thumbnail | String | Image URL |
| subject | Enum | MATH, VIETNAMESE, etc. |
| grade | Enum | Target grade |
| level | Enum | BEGINNER, INTERMEDIATE, ADVANCED |
| duration | Int | Duration in minutes |
| isPublished | Boolean | Publication status |
| isFree | Boolean | Free/paid |
| order | Int | Display order |

**Relations:**
- 1:N → Lecture
- 1:N → Enrollment
- 1:N → Quiz

### lectures
Video lectures within courses.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| courseId | UUID | FK to courses |
| title | String | Lecture title |
| slug | String | URL slug |
| description | Text | Description |
| videoUrl | String | Video URL |
| duration | Int | Duration in seconds |
| order | Int | Display order |
| isPreview | Boolean | Free preview |

**Relations:**
- N:1 → Course
- 1:N → Progress

## 📈 Learning Progress

### enrollments
Student course enrollments.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| studentId | UUID | FK to students |
| courseId | UUID | FK to courses |
| enrolledAt | DateTime | Enrollment time |
| completedAt | DateTime | Completion time |
| progress | Float | Progress % (0-100) |
| lastAccessAt | DateTime | Last access time |

**Unique:** studentId + courseId

### progress
Lecture-level progress tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| studentId | UUID | FK to students |
| lectureId | UUID | FK to lectures |
| isCompleted | Boolean | Completion status |
| watchedSeconds | Int | Seconds watched |
| lastWatchedAt | DateTime | Last watch time |
| completedAt | DateTime | Completion time |

**Unique:** studentId + lectureId

## 📝 Quizzes & Assessment

### quizzes
Quiz definitions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| courseId | UUID | FK to courses |
| title | String | Quiz title |
| description | Text | Description |
| duration | Int | Time limit (minutes) |
| passingScore | Int | Pass threshold (%) |
| maxAttempts | Int | Max attempts allowed |
| order | Int | Display order |
| isActive | Boolean | Active status |

### questions
Quiz questions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| quizId | UUID | FK to quizzes |
| type | Enum | MULTIPLE_CHOICE, TRUE_FALSE, etc. |
| question | Text | Question text |
| options | JSON | Answer options |
| correctAnswer | Text | Correct answer |
| explanation | Text | Answer explanation |
| points | Int | Points for correct |
| order | Int | Display order |

### quiz_attempts
Student quiz attempts.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| quizId | UUID | FK to quizzes |
| studentId | UUID | FK to students |
| score | Float | Score percentage |
| totalPoints | Int | Max points |
| earnedPoints | Int | Points earned |
| isPassed | Boolean | Pass/fail |
| startedAt | DateTime | Start time |
| completedAt | DateTime | Completion time |
| timeSpent | Int | Time spent (seconds) |

### answers
Individual question answers.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| attemptId | UUID | FK to quiz_attempts |
| questionId | UUID | FK to questions |
| answer | Text | Student's answer |
| isCorrect | Boolean | Correct/incorrect |
| pointsEarned | Int | Points earned |

**Unique:** attemptId + questionId

## 🎮 Games

### games
Educational game definitions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | Enum | MATH_QUIZ, WORD_MATCHING, etc. |
| title | String | Game title |
| description | Text | Description |
| subject | Enum | Subject area |
| grade | Enum | Target grade |
| thumbnail | String | Image URL |
| config | JSON | Game configuration |
| isActive | Boolean | Active status |

### game_scores
Student game scores.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| gameId | UUID | FK to games |
| studentId | UUID | FK to students |
| score | Int | Score achieved |
| level | Int | Level reached |
| duration | Int | Time played (seconds) |
| playedAt | DateTime | Play time |

## 🏆 Achievements

### achievements
Achievement definitions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | Enum | COURSE_COMPLETION, QUIZ_MASTER, etc. |
| title | String | Achievement title |
| description | Text | Description |
| icon | String | Icon/emoji |
| xpReward | Int | XP reward |
| condition | JSON | Unlock conditions |

### student_achievements
Student unlocked achievements.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| studentId | UUID | FK to students |
| achievementId | UUID | FK to achievements |
| unlockedAt | DateTime | Unlock time |

**Unique:** studentId + achievementId

## 🤖 AI Chatbot

### chat_sessions
Chat conversation sessions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK to users |
| title | String | Session title |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update |

### chat_messages
Individual chat messages.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sessionId | UUID | FK to chat_sessions |
| role | String | "user" or "assistant" |
| content | Text | Message content |
| createdAt | DateTime | Message time |

## 📊 Indexes

Key indexes for performance:

- **users**: email, role
- **students**: userId, grade, level
- **courses**: slug, subject, grade, isPublished
- **lectures**: courseId, order
- **enrollments**: studentId, courseId
- **progress**: studentId, lectureId
- **quizzes**: courseId, isActive
- **quiz_attempts**: studentId, quizId
- **games**: type, subject, grade
- **game_scores**: studentId, gameId, score

## 🔄 Relationships Summary

```
User ─┬─ Student ─┬─ Enrollment ── Course ─┬─ Lecture ── Progress
      │           ├─ Progress               ├─ Quiz ─┬─ Question
      │           ├─ QuizAttempt ── Answer  │        └─ QuizAttempt
      │           ├─ GameScore ── Game      │
      │           └─ Achievement            └─ ...
      │
      ├─ Parent ── Student
      │
      └─ ChatSession ── ChatMessage
```

## 🎯 Enums

### UserRole
- STUDENT
- PARENT
- ADMIN

### Grade
- GRADE_1, GRADE_2, GRADE_3, GRADE_4, GRADE_5

### Subject
- MATH, VIETNAMESE, ENGLISH, SCIENCE, HISTORY, GEOGRAPHY, ART, MUSIC, PE, LIFE_SKILLS

### CourseLevel
- BEGINNER, INTERMEDIATE, ADVANCED

### QuestionType
- MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK, MATCHING

### GameType
- MATH_QUIZ, WORD_MATCHING, MEMORY_CARD, PUZZLE

### AchievementType
- COURSE_COMPLETION, QUIZ_MASTER, GAME_CHAMPION, STREAK_KEEPER, LEVEL_UP

---

**Last Updated:** 2026-01-01
