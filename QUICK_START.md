# 📋 QUICK REFERENCE GUIDE - New Features

## 🚀 Fast Start

### 1. Run the Application

```bash
# Terminal 1 - Backend
cd backend && npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd client && npm run dev
# Runs on http://localhost:5173
```

### 2. Access the Website

Visit: http://localhost:5173

### 3. Test the 4 New Features

---

## 🎯 Feature Quick Links

### 💬 Chat System

- **Navigate to**: Messages (in navbar)
- **What it does**: Send real-time messages to other users
- **Database**: Stores all chat history
- **Real-time**: Yes (Socket.io)
- **Try it**: Open 2 browser windows with different accounts, both go to Messages tab

### ⭐ Reviews System

- **Navigate to**: Find Partners → View Reviews button
- **What it does**: Leave 5-star reviews and comments on users
- **Auto Updates**: User's average rating updates automatically
- **Database**: Stores reviews with ratings
- **Try it**: Search for a user → Click "View Reviews" → Write a review

### 🔔 Notifications System

- **Navigate to**: Backend storage (no UI yet)
- **What it does**: Stores notifications for events (messages, reviews, etc.)
- **Database**: Keeps all notification history
- **API**: `/api/notifications` endpoints available
- **Real-time**: Ready for Socket.io integration
- **Try it**: Check API with Postman/curl

### 📅 Availability System

- **Navigate to**: Availability (in navbar)
- **What it does**: Create time slots for tutoring sessions
- **Prevents**: Double-booking with auto-conflict detection
- **Database**: Stores all availability slots
- **Try it**: Add a time slot (e.g., 2:00 PM - 3:30 PM), view it listed, edit or delete

---

## 📍 Feature Locations in Code

```
BACKEND (All in /backend):
├── models/
│   ├── ChatMessage.js ...................... Chat storage
│   ├── Review.js ........................... Review storage
│   ├── Notification.js ..................... Notification storage
│   └── Availability.js ..................... Time slot storage
├── routes/chat/chatRoutes.js ............... Chat endpoints
├── routes/reviews/reviewRoutes.js .......... Review endpoints
├── routes/notifications/notificationRoutes.js ... Notification endpoints
└── routes/availability/availabilityRoutes.js .... Availability endpoints

FRONTEND (All in /client/features):
├── real-time-chat/
│   ├── components/......................... Chat UI components
│   ├── services/chatApi.js ................ API calls
│   └── pages/ChatPage.jsx ................. Chat page
├── rating-review/
│   ├── components/ ........................ Review UI components
│   └── services/reviewApi.js .............. API calls
├── push-notifications/
│   └── services/notificationService.js .... Notification API
└── availability-management/
    ├── components/ ........................ Availability Manager UI
    ├── services/availabilityApi.js ........ API calls
    └── pages/AvailabilityPage.jsx ......... Availability page
```

---

## 🔌 API Endpoints Reference

### Chat

```
GET    /api/chat/messages/:userId
GET    /api/chat/conversations
POST   /api/chat/mark-read/:userId
```

### Reviews

```
POST   /api/reviews
GET    /api/reviews/user/:userId
GET    /api/reviews/my-reviews
```

### Notifications

```
GET    /api/notifications
POST   /api/notifications/mark-read/:id
POST   /api/notifications/mark-all-read
POST   /api/notifications/send
```

### Availability

```
GET    /api/availability
POST   /api/availability
PUT    /api/availability/:id
DELETE /api/availability/:id
GET    /api/availability/user/:userId
POST   /api/availability/:id/book
```

---

## 🧪 Testing Checklist

### Setup

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Create 2 test accounts

### Chat Testing

- [ ] Navigate to Messages page
- [ ] See conversation list
- [ ] Send message in real-time
- [ ] Message persists after refresh
- [ ] Unread count shows

### Reviews Testing

- [ ] Go to Find Partners
- [ ] Click View Reviews on a user
- [ ] Click Review button
- [ ] Submit 5-star review with comment
- [ ] See average rating update
- [ ] Review appears in list

### Availability Testing

- [ ] Go to Availability page
- [ ] Click Add Slot
- [ ] Enter date and time range
- [ ] Slot appears in list
- [ ] Click Edit to modify
- [ ] Click Delete to remove
- [ ] Try overlapping time (should error)

### Notifications Testing (Optional)

- [ ] Use Postman to POST to /api/notifications/send
- [ ] Check GET /api/notifications returns data
- [ ] Test mark-read endpoint

---

## 🛠️ Common Issues & Solutions

### Chat not connecting

```
Issue: Messages not sending
Solution: Check browser console for Socket.io errors
         Reload page and try again
         Verify both users are authenticated
```

### Reviews not showing

```
Issue: Reviews appear blank
Solution: Clear browser cache (Ctrl+Shift+Delete)
         Refresh page
         Check if user has written any reviews
```

### Availability time conflict

```
Issue: "Time slot conflicts" error
Solution: Check existing slots don't overlap
         Verify time format is HH:MM (24-hour)
         Example: 14:00 not 2:00 PM
```

### Server not starting

```
Issue: Port 5000 already in use
Solution: Kill existing processes: taskkill /f /im node.exe
         Or change PORT in backend/.env
```

---

## 📝 Database Models Summary

### ChatMessage

```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  message: String,
  timestamp: Date,
  isRead: Boolean
}
```

### Review

```javascript
{
  reviewerId: ObjectId,
  targetUserId: ObjectId,
  sessionId: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### Notification

```javascript
{
  userId: ObjectId,
  title: String,
  body: String,
  type: Enum (session_update, credit_change, message, review, general),
  data: Object,
  sentAt: Date,
  readAt: Date
}
```

### Availability

```javascript
{
  userId: ObjectId,
  date: Date,
  startTime: String (HH:MM),
  endTime: String (HH:MM),
  isBooked: Boolean,
  bookedBy: ObjectId,
  createdAt: Date
}
```

---

## 🎓 Learning Resources

- **Real-time Chat**: Socket.io documentation
- **Ratings/Reviews**: Mongoose aggregate functions
- **Notifications**: Firebase FCM setup guide
- **Time Slots**: Date/Time validation patterns

---

## ✅ Verification Checklist

### Backend Verification

- [x] All 4 models created and exported
- [x] All routes mounted on /api prefix
- [x] Socket.io configured and listening
- [x] MongoDB collections auto-created
- [x] Authentication middleware applied

### Frontend Verification

- [x] All components rendering without errors
- [x] Navigation links working
- [x] API calls using correct endpoints
- [x] Socket.io client connecting
- [x] localStorage persisting data

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update JWT_SECRET in environment
- [ ] Configure production MongoDB
- [ ] Set up Firebase (if using notifications)
- [ ] Configure CORS origins
- [ ] Test all features in production build
- [ ] Set up environment variables
- [ ] Enable HTTPS for Socket.io
- [ ] Configure database backups

---

## 📞 Support

For issues:

1. Check browser console for errors
2. Check server terminal output
3. Review database collections
4. Test API endpoints with Postman
5. Check authentication token in localStorage

---

## 🎉 You're Ready!

All 4 features are implemented and ready to test.

**Start with:**

1. Run servers
2. Create test accounts
3. Visit Messages page
4. Send a test message
5. Leave a test review
6. Create availability slots

Enjoy! 🌟
