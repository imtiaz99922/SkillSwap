# Demo Quiz Feature - Quick Reference

## 🎯 The Workflow (30 seconds)

1. **Skills** → Add Skill (choose "teach") → Create Skill
2. ➡️ **Auto-redirect** to Create Course page
3. **Fill Course Details** + Optional: Expand "Add Demo Quiz" + Add Questions
4. **Click "Create Course"** → Done!
5. **Go to Quizzes** → See your demo quiz under "Demo Quizzes" tab

---

## 📍 Key Pages & Routes

| What          | URL               | File                                                     |
| ------------- | ----------------- | -------------------------------------------------------- |
| Create Skill  | `/skills`         | `client/src/features/skills/pages/SkillsPage.jsx`        |
| Create Course | `/courses/create` | `client/src/features/courses/pages/CourseCreatePage.jsx` |
| View Quizzes  | `/quizzes`        | `client/src/features/quiz/pages/QuizListPage.jsx`        |

---

## 🔧 New Backend Routes

```
POST   /api/demo-quizzes                 Create demo quiz
GET    /api/demo-quizzes                 Get all demo quizzes
GET    /api/demo-quizzes/course/:id      Get by course
GET    /api/demo-quizzes/:id             Get single
PUT    /api/demo-quizzes/:id             Update
DELETE /api/demo-quizzes/:id             Delete
```

---

## 📦 New Frontend Files

```
client/src/features/courses/
  ├── pages/
  │   └── CourseCreatePage.jsx          Main form
  └── services/
      └── courseApi.js                  API wrapper

client/src/features/quiz/services/
  └── demoQuizApi.js                    Demo quiz API wrapper
```

---

## 🧩 Component Props

### CourseCreatePage

- No props needed
- Gets skill ID from URL: `?skillId=xxx`
- Fetches user's teach skills on mount

### Updated QuizListPage

- Now fetches both challenges and demo quizzes
- Shows tabs for filtering
- Displays appropriate badges

---

## 💾 Database Collections Used

1. **Skill** - Links to course via `courseId` field
2. **Course** - Already exists, used as-is
3. **DemoQuiz** - NEW collection with full structure

---

## 🔐 Auth Requirements

| Action           | Auth Required | Who Can           |
| ---------------- | ------------- | ----------------- |
| Create demo quiz | ✅ Yes        | Course instructor |
| View demo quiz   | ❌ No         | Everyone          |
| Update demo quiz | ✅ Yes        | Course instructor |
| Delete demo quiz | ✅ Yes        | Course instructor |

---

## 🐛 Common Issues & Fixes

### Issue: "Skill not found" after creating skill

- Make sure to create a "teach" type skill
- Redirect only happens for teach skills

### Issue: Demo quiz not showing in list

- Make sure quiz was created with course
- Check if course creation succeeded
- Demo quizzes require a courseId to display

### Issue: Questions not saving

- Fill in all required fields (question text, options, mark correct)
- Check browser console for errors
- Ensure at least 1 option is marked as correct

---

## ✅ Verification Checklist

- [x] Backend route created: `/backend/routes/demo-quizzes.js`
- [x] Backend route registered in `server.js`
- [x] CourseCreatePage component created
- [x] Course API service created
- [x] Demo quiz API service created
- [x] SkillForm simplified (removed course fields)
- [x] SkillsPage redirect logic added
- [x] QuizListPage updated with tabs
- [x] App.jsx route added
- [x] Documentation created

---

## 🚀 Ready to Use

The feature is **fully implemented and ready for testing**!

### Test It:

1. Go to `/skills`
2. Click "Add Skill"
3. Fill in skill (type="teach")
4. Click "Create Skill"
5. Should redirect to `/courses/create`
6. Fill course and demo quiz
7. Click "Create Course"
8. Go to `/quizzes`
9. Check "Demo Quizzes" tab

---

## 📞 Support

For questions or issues, check:

- `DEMO_QUIZ_FEATURE_SUMMARY.md` - Full feature overview
- `DEMO_QUIZ_IMPLEMENTATION_GUIDE.md` - Technical details
- Backend route file: `backend/routes/demo-quizzes.js`
- Frontend component: `client/src/features/courses/pages/CourseCreatePage.jsx`

---

**Last Updated**: April 28, 2026 ✨
**Status**: Ready for Testing ✅
