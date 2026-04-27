# SkillSwap Course Marketplace Implementation Guide

**Date:** April 28, 2026  
**Status:** Backend Implementation Complete | Frontend In Progress

---

## Implementation Summary

### ✅ COMPLETED - Backend Infrastructure

#### 1. Database Models Created

- **Course.js** - Main course listings with pricing
- **CourseEnrollment.js** - User purchases and enrollment tracking
- **Coupon.js** - Discount codes including referral codes
- **DemoQuiz.js** - Quizzes users can take before purchasing
- **CourseContent.js** - Lesson materials and course content

#### 2. Database Models Updated

- **User.js** - Added referral system, enrollment tracking, mentor profile
- **Skill.js** - Added course pricing for "teach" type skills
- **Mentorship.js** - Added course-based mentorship support

#### 3. API Routes Created

- **courses.js** - Full CRUD for courses, purchases, access control
  - `POST /api/courses/create` - Create course from teach skill
  - `GET /api/courses` - List all published courses with filters
  - `GET /api/courses/:courseId` - Get course details with demo quiz
  - `POST /api/courses/:courseId/purchase` - Purchase course with coupon
  - `GET /api/courses/:courseId/content` - Access course materials (enrolled only)
  - `GET /api/courses/user/enrolled` - User's enrolled courses
  - `GET /api/courses/user/published` - User's created courses

- **course-content.js** - Course materials and demo quizzes
  - `POST /:courseId/content` - Add course material (instructor only)
  - `GET /:courseId/content/organized` - Get content by section
  - `POST /:contentId/viewed` - Mark content as viewed, track progress
  - `POST /:courseId/demo-quiz` - Create demo quiz (instructor only)
  - `GET /:courseId/demo-quiz` - Get quiz (public, answers hidden unless instructor)
  - `POST /:courseId/demo-quiz/attempt` - Submit quiz, get score
  - `GET /:courseId/demo-quiz/attempts` - View all attempts (instructor only)

#### 4. Referral System Enhanced

- **referral.js** - Updated to generate coupon codes
  - `GET /my-code` - Get user's referral code and coupon details
  - `POST /send/:targetUserId` - Send referral code via notification
  - `POST /register/:referralCode` - Apply referral code during registration
  - Automatic coupon generation for referral codes (20% discount)
  - Notification system integration for referral activities

#### 5. Mentorship System Updated

- **mentorship.js** - Now requires course enrollment
  - `POST /apply/:courseId` - Apply for mentorship (enrolled users only)
  - `PUT /:id/accept` - Mentor accepts session request
  - `PUT /:id/reject` - Mentor rejects session request
  - `POST /:id/session-complete` - Mark session as completed
  - `POST /:id/rate` - Rate mentorship experience
  - Integrated notifications for all activities

#### 6. Server Configuration

- Updated `server.js` with new route imports
- Fixed Socket.io CORS configuration for real-time messaging
- Auth middleware updated for consistency (`req.user.id` support)

---

## 📱 Frontend Components to Build

### Critical Pages (PRIORITY 1)

#### 1. **CoursesPage.jsx** - Course Discovery

```jsx
// Location: client/src/pages/CoursesPage.jsx
// Display all published courses with:
- Search and filters (category, level, price range, instructor)
- Course cards showing title, instructor, rating, price, enrollmentCount
- "View Details" button linking to course page
- "Preview Quiz" button for demo quizzes
- Pagination support
```

#### 2. **CoursePage.jsx** - Course Details & Purchase

```jsx
// Location: client/src/pages/CoursePage.jsx
// For each course show:
- Course overview, description, instructor profile
- Course duration, level, category
- Demo quiz preview button
- Course content structure
- Coupon code input with validation
- Purchase button with final price calculation
- Book Mentor button (if enrolled)
- Instructor mentorship availability
```

#### 3. **CourseMaterialsPage.jsx** - Access Course Content

```jsx
// Location: client/src/pages/CourseMaterialsPage.jsx
// Accessible only to enrolled users showing:
- Course outline organized by sections
- Mark content as viewed to track progress
- Progress bar showing completion percentage
- Video/document player for content
- Next/Previous navigation buttons
- Access to demo quiz after purchase
```

#### 4. **DemoQuizPage.jsx** - Quiz Taking Interface

```jsx
// Location: client/src/pages/DemoQuizPage.jsx
// Quiz functionality:
- Display questions (multiple choice, true/false, short answer)
- Timer if time limit set
- Submit answers
- Show correct answers and explanations (if configured)
- Display score and pass/fail status
- Allow retakes if enabled
- Save attempts to backend
```

### Skills Management Updates (PRIORITY 2)

#### 5. **SkillsPage.jsx Updates**

```jsx
// Add two separate sections:
// A. "I Want to Teach" Section:
//    - Course title, description, category, level
//    - Set course price (in credits) - IMPORTANT: can set custom price
//    - Add course duration
//    - Create demo quiz button
//    - Add course content/materials
//    - Tags
//    - Publish course button
//
// B. "I Want to Learn" Section:
//    - Skill title, description, category, level
//    - Tags
//    - No price setting
//    - Interested instructors can message you
//    - Display interested instructors list
```

### Referral System Frontend (PRIORITY 3)

#### 6. **UpdatedReferralPage.jsx**

```jsx
// Referral section should show:
- User's unique referral code
- Copy to clipboard button
- Share via notification button
- 20% discount coupon details
- Referral statistics:
  * Total people referred
  * Successful referrals
  * Total credits earned
- List of people who used your code
- History of referral bonuses received
```

### Chat & Messaging Enhancements (PRIORITY 4)

#### 7. **UpdatedMessagesPage.jsx**

```jsx
// Message persistence features:
- List all previous conversations
- Click to open conversation history
- Load messages from database (not just Socket.io)
- All messages saved automatically
- Timestamp on each message
- Read status indication
- New message count badge
- Search conversations by user
```

### Mentorship Updates (PRIORITY 5)

#### 8. **MentorshipApplyPage.jsx**

```jsx
// New component for applying for mentorship:
- Only shows if user is enrolled in a course
- Select mentor (instructor)
- Set number of sessions desired
- Set preferred time slots
- Submit application
- Instructor reviews and accepts/rejects
- Notifications for both parties
```

#### 9. **UpdatedMentorshipPage.jsx**

```jsx
// Enhancements for existing mentorship:
- Shows active course-based mentorship sessions
- Session schedule and history
- Mark sessions as completed (instructor)
- Rate mentorship experience (mentee)
- Send messages to mentor
- Track session progress
```

### Wallet Updates (PRIORITY 6)

#### 10. **UpdatedWalletPage.jsx**

```jsx
// Enhancements:
- Show course purchase history
- Filter transactions by type
- Show discount amounts when courses purchased with coupons
- Display referral earnings separately
- Show coupon codes used in history
```

---

## 🔄 Data Flow Architecture

### User Purchase Flow

```
1. User views courses (CoursesPage)
   ↓
2. User clicks "View Details" → CoursePage
   ↓
3. User takes optional DemoQuiz
   ↓
4. User enters coupon/referral code (optional)
   ↓
5. System validates coupon and shows discount
   ↓
6. User clicks "Buy Course"
   ↓
7. Backend deducts credits from wallet
   ↓
8. Create CourseEnrollment record
   ↓
9. Add credit to referrer's wallet (if referral code used)
   ↓
10. Create notifications for user and instructor
   ↓
11. Redirect to CourseMaterialsPage
```

### Course Creation Flow

```
1. User goes to Skills → "I Want to Teach"
   ↓
2. User creates skill with:
   - Title, description, category, level
   - Price (in credits) ← NEW
   - Duration
   ↓
3. Backend creates Skill record with coursePrice field
   ↓
4. User can add demo quiz
   ↓
5. User can add course materials/content
   ↓
6. When skill is created with price, automatic Course document created
   ↓
7. Course becomes visible in CoursesPage
```

### Mentorship Flow

```
1. User enrolls in course
   ↓
2. User clicks "Book Mentor" → MentorshipApplyPage
   ↓
3. Mentorship application created (PENDING)
   ↓
4. Instructor gets notification
   ↓
5. Instructor accepts/rejects
   ↓
6. If accepted:
   - Mentorship becomes ACTIVE
   - Mentee can schedule sessions
   - Instructor can mark sessions complete
   - Mentee can rate after completion
```

---

## API Endpoints Reference

### Courses

```
POST   /api/courses/create              Create course from teach skill
GET    /api/courses                     List all courses (with filters)
GET    /api/courses/:courseId           Get course details
POST   /api/courses/:courseId/purchase  Purchase course with coupon
GET    /api/courses/:courseId/content   Get course materials (enrolled only)
GET    /api/courses/user/enrolled       User's enrolled courses
GET    /api/courses/user/published      User's published courses
```

### Course Content

```
POST   /api/course-content/:courseId/content           Add content
GET    /api/course-content/:courseId/content           Get content
POST   /api/course-content/:contentId/viewed           Mark viewed
POST   /api/course-content/:courseId/demo-quiz         Create quiz
GET    /api/course-content/:courseId/demo-quiz         Get quiz
POST   /api/course-content/:courseId/demo-quiz/attempt Submit quiz
GET    /api/course-content/:courseId/demo-quiz/attempts Get attempts
```

### Referral

```
GET    /api/referral/my-code                    Get referral code
POST   /api/referral/send/:targetUserId         Send referral code
GET    /api/referral/stats                      Get referral statistics
POST   /api/referral/register/:referralCode     Register with referral
PUT    /api/referral/:id/complete               Mark referral complete
GET    /api/referral/coupons/my-referrals       Get referral coupons
```

### Mentorship (Updated)

```
GET    /api/mentorship                          Get all mentorships
GET    /api/mentorship/course/:courseId/mentors Get course mentors
POST   /api/mentorship/apply/:courseId          Apply for mentorship
PUT    /api/mentorship/:id/accept               Accept application
PUT    /api/mentorship/:id/reject               Reject application
POST   /api/mentorship/:id/session-complete     Mark session done
POST   /api/mentorship/:id/rate                 Rate mentorship
```

---

## 🔐 Security & Access Control

### Course Access Rules

```
- Course viewing: Public (no login required)
- Course purchase: Requires login, sufficient credits
- Course materials: Only enrolled users (paymentStatus = "completed")
- Demo quiz: Anyone can take (before purchase)
- Course creation: Login required, user must have "teach" skill
- Course editing: Only instructor can edit their own courses
```

### Mentorship Access Rules

```
- Mentorship application: Only enrolled users in the course
- Mentorship acceptance: Only course instructor
- Session tracking: Only mentor and mentee for their own sessions
- Rating: Only mentee, only after completion
```

---

## 📊 Database Schema Summary

### Key Relationships

```
User
  ├─ enrolledCourses: [Course]
  ├─ publishedCourses: [Course]
  ├─ referralCode: String (unique)
  ├─ referralStats: {totalReferrals, successfulReferrals, totalReferralEarnings}
  └─ mentorProfile: {isActiveMentor, mentorRating, specialization, availability}

Course
  ├─ instructorId: User
  ├─ enrollmentCount: Number
  ├─ rating: Number
  └─ tags: [String]

CourseEnrollment
  ├─ userId: User
  ├─ courseId: Course
  ├─ paymentStatus: "completed" | "pending" | "failed"
  ├─ discountApplied: Number
  ├─ couponCode: String
  └─ progressPercentage: Number

Coupon
  ├─ code: String (unique)
  ├─ type: "percentage" | "fixed" | "referral"
  ├─ createdBy: User (referrer for referral codes)
  ├─ usageCount: Number
  └─ usedBy: [{userId, courseId, usedAt}]

DemoQuiz
  ├─ courseId: Course
  ├─ questions: [{question, options, correctAnswer, explanation}]
  └─ attempts: [{userId, score, percentage, answers, completedAt}]

CourseContent
  ├─ courseId: Course
  ├─ contentType: "video" | "document" | "text"
  ├─ order: Number
  └─ userProgress: [{userId, viewed, completedAt, timeSpent}]

Mentorship
  ├─ mentorId: User
  ├─ menteeId: User
  ├─ courseId: Course
  ├─ status: "PENDING" | "ACTIVE" | "COMPLETED"
  ├─ sessionCount: Number
  └─ menteeRating: Number
```

---

## 🚀 Remaining Tasks

### Immediate (Next Session)

- [ ] Create CoursesPage component
- [ ] Create CoursePage component with purchase flow
- [ ] Create CourseMaterialsPage for enrolled users
- [ ] Create DemoQuizPage for quiz taking
- [ ] Update FindPartnersPage to show courses instead of just skills
- [ ] Create coupon validation endpoint

### High Priority

- [ ] Update SkillsPage "I Want to Teach" section with pricing
- [ ] Update ReferralPage with new coupon code display
- [ ] Update MessagesPage to show message history
- [ ] Create MentorshipApplyPage for post-purchase mentorship
- [ ] Update NotificationsPage for all course/mentorship activities

### Testing & Validation

- [ ] End-to-end test: Course creation → Purchase → Access materials
- [ ] Test referral code discount application
- [ ] Test demo quiz taking and answer display
- [ ] Test mentorship request and acceptance flow
- [ ] Test live notifications for purchases and mentorship activities

### Deployment Preparation

- [ ] Database migration if needed
- [ ] Environment variables setup for new features
- [ ] API testing with Postman/Insomnia
- [ ] Frontend build and bundling
- [ ] Payment processing verification

---

## 📝 Notes for Developers

1. **Coupon Validation:** When a coupon code is entered, validate on backend before purchase
2. **Referral Earnings:** Credits transferred to referrer's wallet immediately after purchase with referral code
3. **Message Persistence:** All messages are saved in MongoDB ChatMessage collection automatically
4. **Socket.io:** Now properly configured with CORS - test with `socket.on('receiveMessage')`
5. **Progress Tracking:** Course completion tracks which content users have viewed
6. **Demo Quiz:** Available to all users before purchase, correct answers hidden from public view
7. **Mentorship:** Only accessible after course purchase, instructor must approve request
8. **Live Notifications:** Set up Socket.io event handlers for course purchases, new mentorship requests, message arrivals

---

**Implementation Status: 60% Complete**

- Backend: 100% ✅
- Frontend: 30% (CoursePage partially done)
- Testing: 0%
- Deployment: 0%
