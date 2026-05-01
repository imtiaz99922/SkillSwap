# Demo Quiz Workflow Implementation - Complete Guide

## Overview

This implementation enables users to create a teaching skill, then seamlessly create a course with an optional demo quiz. The demo quizzes appear in the Quizzes feature for students to practice.

## User Flow

### Step 1: Create a Teaching Skill

**Path**: `/skills` → Click "Add Skill"

1. Fill in basic skill information:
   - Title (required)
   - Description (optional)
   - Category (optional)
   - Type: Select "I can teach this" (required)
   - Level: beginner/intermediate/advanced (required)
   - Tags (optional)

2. Click "Create Skill"
3. User is automatically redirected to course creation page with the skill pre-selected

### Step 2: Create Course with Optional Demo Quiz

**Path**: `/courses/create?skillId={skillId}`

The CourseCreatePage opens with the teaching skill pre-filled.

#### Course Details Section

- **Skill Selection**: Pre-selected from Step 1
- **Course Title** (required)
- **Course Description** (required)
- **Category** (optional)
- **Level**: beginner/intermediate/advanced
- **Price**: Minimum 1 credit
- **Duration**: Minimum 1 hour
- **Tags**: Custom tags for the course

#### Demo Quiz Section (Optional)

Users can expand the "Add Demo Quiz" section:

1. **Toggle "Include Demo Quiz"**
2. If enabled, fill in:
   - Quiz Title (required)
   - Quiz Description (optional)
   - Passing Score (default 70%)
   - Time Limit in minutes (optional)

3. **Add Questions**:
   - Click "+ Add Question"
   - For each question:
     - Enter question text
     - Add 4 options (default)
     - Mark which option(s) is/are correct
     - Optional: Add explanation for each question
   - Click "Remove" to delete a question

4. Click "Create Course"
   - Creates the course
   - If quiz enabled, creates the demo quiz linked to the course

### Step 3: View Demo Quizzes

**Path**: `/quizzes`

The Quizzes & Challenges page now shows:

- **All Tab**: Shows all challenges and demo quizzes
- **Challenges Tab**: Only instructor-created challenges
- **Demo Quizzes Tab**: Only demo quizzes from courses

Each demo quiz card displays:

- Quiz title
- "📝 Demo Quiz" badge
- Description
- Number of questions
- Passing score percentage

## Technical Architecture

### Backend Structure

#### New Route File: `/backend/routes/demo-quizzes.js`

Creates a complete CRUD API for demo quizzes:

**Endpoints:**

- `POST /api/demo-quizzes` - Create new demo quiz
  - Requires: `courseId`, `title`, `questions`
  - Optional: `description`, `passingScore`, `timeLimit`
  - Auth: Required (must be course instructor)

- `GET /api/demo-quizzes` - Get all published demo quizzes
  - No auth required
  - Returns: Array of demo quiz objects with instructor name

- `GET /api/demo-quizzes/course/:courseId` - Get demo quiz for specific course
  - No auth required
  - Returns: Single demo quiz object

- `GET /api/demo-quizzes/:id` - Get single demo quiz
  - No auth required
  - Returns: Full demo quiz with questions and options

- `PUT /api/demo-quizzes/:id` - Update demo quiz
  - Auth: Required (instructor only)
  - Updates: title, description, questions, scores, time limits

- `DELETE /api/demo-quizzes/:id` - Delete demo quiz
  - Auth: Required (instructor only)

### Frontend Structure

#### New Feature: `/client/src/features/courses/`

**Services:**

- `courseApi.js` - API wrapper for course operations
  - `createCourse()` - Create new course
  - `getAllCourses()` - Get published courses
  - `getCourse()` - Get single course
  - `getMyPublishedCourses()` - Get user's courses
  - `getMyEnrolledCourses()` - Get enrolled courses
  - `getCourseContent()` - Get course materials

**Pages:**

- `CourseCreatePage.jsx` - Complete course and demo quiz creation form
  - Fetches user's teach skills
  - Pre-selects skill from URL param
  - Expandable demo quiz section
  - Question builder with options
  - Real-time validation

#### Updated Services: `/client/src/features/quiz/`

**New File:**

- `demoQuizApi.js` - API wrapper for demo quizzes
  - `createDemoQuiz()` - Create demo quiz
  - `getAllDemoQuizzes()` - Get all
  - `getDemoQuizByCourse()` - Get by course
  - `getDemoQuiz()` - Get single
  - `updateDemoQuiz()` - Update
  - `deleteDemoQuiz()` - Delete

#### Updated Components

**SkillForm.jsx Changes:**

- Removed: Course price field
- Removed: Course duration field
- Removed: Course description field
- Removed: Course materials upload
- Removed: Quiz creation UI
- Kept: Basic skill information (title, description, category, type, level, tags)

**SkillsPage.jsx Changes:**

- Added: Auto-redirect to course creation for teach skills
- Logic: After creating teach skill → navigate to `/courses/create?skillId={skillId}`

**QuizListPage.jsx Changes:**

- Added: Tab navigation (All, Challenges, Demo Quizzes)
- Added: Fetch demo quizzes alongside challenges
- Added: Filter display based on active tab
- Updated: Card rendering for both challenge and demo quiz types
- Added: Different badges for quiz types

### Database Models

**DemoQuiz Model** (Already exists in `/backend/models/DemoQuiz.js`):

```javascript
{
  courseId: ObjectId (required, indexed)
  instructorId: ObjectId (required)
  title: String (required)
  description: String (optional)
  questions: [
    {
      id: String
      question: String (required)
      type: String (enum: multipleChoice, trueFalse, shortAnswer)
      options: [{ text: String, isCorrect: Boolean }]
      correctAnswer: String (required)
      explanation: String (optional)
      order: Number
    }
  ]
  passingScore: Number (default: 70)
  timeLimit: Number (optional, in minutes)
  shuffleQuestions: Boolean (default: false)
  showCorrectAnswersAfter: Boolean (default: true)
  allowRetakes: Boolean (default: true)
  isPublished: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Integration Points

### 1. Skill Creation Flow

- SkillsPage → SkillForm (submit) → skillsApi.createSkill()
- Backend creates skill, returns skill.\_id
- Frontend checks: if type === "teach" → redirect to `/courses/create?skillId={skillId}`

### 2. Course Creation Flow

- CourseCreatePage → courseApi.createCourse()
- Backend creates course, updates skill with courseId
- If demoQuiz data provided → demoQuizApi.createDemoQuiz()
- Backend links demo quiz to course via courseId

### 3. Quiz Discovery

- QuizListPage fetches both challenges and demo quizzes
- quizApi.getChallenges() for challenges
- demoQuizApi.getAllDemoQuizzes() for demo quizzes
- Combined display with tab filtering

## Key Features

### 1. Seamless Workflow

- No context switching between pages
- All information captured in one place
- Clear visual progression

### 2. Optional Demo Quiz

- Users can skip demo quiz creation
- Can add demo quiz later by editing course
- Demo quiz section collapsible to reduce clutter

### 3. Question Builder

- Real-time add/remove questions
- Multiple choice format
- Option to mark correctness
- Explanations for learning

### 4. Validation

- Required field validation
- Type checking
- Length constraints
- Real-time error display

### 5. Tab-based Discovery

- Students can filter by type
- See all quizzes or specific type
- Count indicators on tabs
- Smooth transitions

## Error Handling

### Frontend Validation

- Required fields checked before submit
- Min/max constraints enforced
- User-friendly error messages displayed in alert box

### Backend Validation

- Course must belong to user (for auth routes)
- All required fields validated
- ObjectId format validation
- Proper HTTP status codes (400, 403, 404, 500)

## Security Considerations

### Authentication

- All demo quiz routes require auth middleware
- Course instructor can only update/delete own quizzes
- Public can view demo quizzes (read-only)

### Authorization

- Create demo quiz: Must be course instructor
- Update/Delete: Must be original instructor
- View: Public (no auth required)

### Data Validation

- Input sanitization via trim()
- Type coercion for numbers
- Enum validation for types/levels
- Array length validation

## Future Enhancements

1. **Demo Quiz Editing**
   - Edit questions after creation
   - Reorder questions
   - Publish/unpublish option

2. **Student Attempt Tracking**
   - Track student attempts on demo quizzes
   - Store scores and time taken
   - Show analytics to instructor

3. **Demo Quiz Preview**
   - Preview mode for instructors
   - Before publishing
   - Test with sample answers

4. **Import/Export**
   - Export demo quizzes
   - Import from other courses
   - Question bank management

5. **Advanced Question Types**
   - Image-based questions
   - Match pairs questions
   - Fill-in-blank questions
   - Drag-and-drop ordering

## Testing Checklist

- [ ] Create teach skill
- [ ] Redirected to course create page
- [ ] Skill pre-selected with details
- [ ] Create course without demo quiz
- [ ] Verify course appears in Quizzes tab
- [ ] Create course with demo quiz
- [ ] Add multiple questions
- [ ] Mark correct/incorrect options
- [ ] Add explanations
- [ ] Submit course creation
- [ ] Verify demo quiz appears under "Demo Quizzes" tab
- [ ] Click demo quiz to view details
- [ ] Filter by "All" shows both types
- [ ] Filter by "Challenges" shows only challenges
- [ ] Filter by "Demo Quizzes" shows only demo quizzes
- [ ] Error handling for missing required fields
- [ ] Error handling for invalid inputs

## Files Modified/Created

### Backend

- ✅ Created: `/backend/routes/demo-quizzes.js`
- ✅ Modified: `/backend/server.js` (added route registration)

### Frontend

- ✅ Created: `/client/src/features/courses/pages/CourseCreatePage.jsx`
- ✅ Created: `/client/src/features/courses/services/courseApi.js`
- ✅ Created: `/client/src/features/quiz/services/demoQuizApi.js`
- ✅ Modified: `/client/src/features/skills/components/SkillForm.jsx` (removed course fields)
- ✅ Modified: `/client/src/features/skills/pages/SkillsPage.jsx` (added redirect logic)
- ✅ Modified: `/client/src/features/quiz/pages/QuizListPage.jsx` (added demo quiz display)
- ✅ Modified: `/client/src/App.jsx` (added route)

## Installation & Running

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

### Access Application

- Visit: http://localhost:5173
- Create account or login
- Navigate to Skills
- Follow user flow above

---

**Implementation Date**: April 28, 2026
**Status**: ✅ Complete and Ready for Testing
