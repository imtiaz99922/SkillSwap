# 🌟 New Features Implementation Guide

This document describes the four new features that have been implemented for the SkillSwap project.

---

## 1. 💬 Real-Time Chat System

### Overview

Real-time one-to-one messaging between users with persistent chat history in MongoDB.

### Backend

- **Model**: `backend/models/ChatMessage.js`
  - `senderId` (ObjectId) - Sender's user ID
  - `receiverId` (ObjectId) - Recipient's user ID
  - `message` (String) - Chat message content
  - `timestamp` (Date) - Message timestamp
  - `isRead` (Boolean) - Read status

- **Routes**: `backend/routes/chat/chatRoutes.js`
  - `GET /api/chat/messages/:userId` - Get chat history with a specific user
  - `GET /api/chat/conversations` - Get list of conversations with unread counts
  - `POST /api/chat/mark-read/:userId` - Mark messages as read

- **Socket.io Integration**: `backend/server.js`
  - Real-time message delivery via WebSocket
  - User rooms for personalized notifications
  - Message broadcasting to both sender and receiver

### Frontend

- **Components**:
  - `client/features/real-time-chat/frontend/components/Chat.jsx` - Chat bubble interface
  - `client/features/real-time-chat/frontend/components/ChatList.jsx` - Conversation list
- **Services**: `client/features/real-time-chat/frontend/services/chatApi.js`
  - HTTP API methods for chat history and conversations

- **Pages**: `client/features/real-time-chat/frontend/pages/ChatPage.jsx`

- **Route**: `/chat` - Message page with chat interface

### Usage

1. Navigate to **Messages** in navbar
2. See existing conversations with unread message count
3. Click on a conversation to open chat bubble
4. Send real-time messages to the user
5. All messages are persisted to database

---

## 2. ⭐ Rating and Review System

### Overview

Users can rate and review each other after sessions. Average ratings are displayed on profiles.

### Backend

- **Model**: `backend/models/Review.js`
  - `reviewerId` (ObjectId) - User giving review
  - `targetUserId` (ObjectId) - User being reviewed
  - `sessionId` (ObjectId, optional) - Associated session
  - `rating` (Number 1-5) - Star rating
  - `comment` (String, max 500 chars) - Review comment
  - `createdAt` (Date) - Review timestamp

- **Routes**: `backend/routes/reviews/reviewRoutes.js`
  - `POST /api/reviews` - Create new review
  - `GET /api/reviews/user/:userId` - Get reviews for a user
  - `GET /api/reviews/my-reviews` - Get reviews written by current user

- **Auto-Update**: UserProfile rating automatically updates as reviews are added
  - Calculates average rating (rounded to 1 decimal)
  - Tracks total review count

### Frontend

- **Components**:
  - `client/features/rating-review/frontend/components/ReviewForm.jsx` - Review submission form
  - `client/features/rating-review/frontend/components/ReviewsList.jsx` - Display reviews

- **Services**: `client/features/rating-review/frontend/services/reviewApi.js`

- **Integration**: Updated UserCard component to show review count and "View Reviews" button

### Usage

1. Navigate to **Find Partners** page
2. Click "View Reviews" on any user card
3. See all reviews with star ratings and comments
4. Click "Review This User" to submit a review

---

## 3. 🔔 Push Notification System

### Overview

Send push notifications for session updates, credit changes, and messages. Includes Firebase Cloud Messaging integration support.

### Backend

- **Model**: `backend/models/Notification.js`
  - `userId` (ObjectId) - Notification recipient
  - `title` (String) - Notification title
  - `body` (String) - Notification message
  - `type` (Enum) - session_update, credit_change, message, review, general
  - `data` (Mixed) - Additional metadata
  - `sentAt` (Date) - Sent timestamp
  - `readAt` (Date) - Read status timestamp

- **Routes**: `backend/routes/notifications/notificationRoutes.js`
  - `GET /api/notifications` - Get user's notifications with pagination
  - `POST /api/notifications/mark-read/:id` - Mark single notification as read
  - `POST /api/notifications/mark-all-read` - Mark all as read
  - `POST /api/notifications/send` - Send notification (internal use)

- **Firebase Ready**: Service includes helper functions for Firebase Cloud Messaging
  - Structure ready for FCM token registration
  - Multi-device notification delivery support

### Frontend

- **Services**: `client/features/push-notifications/frontend/services/notificationService.js`
  - `notificationApi` - REST endpoints for notifications
  - `firebaseMessaging` - Firebase integration utilities
    - Permission request
    - Service Worker registration
    - Token management
    - Incoming message handling

### Usage

1. Notifications appear in real-time via Socket.io
2. GET /api/notifications - Retrieve notification history
3. Mark notifications as read when viewed
4. Firebase FCM can be configured in environment variables

**Environment Variables for Firebase**:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

---

## 4. 📅 Availability Management System

### Overview

Users set and manage available time slots. Prevents double-booking and enables session scheduling.

### Backend

- **Model**: `backend/models/Availability.js`
  - `userId` (ObjectId) - User offering the slot
  - `date` (Date) - Availability date
  - `startTime` (String HH:MM format) - Session start time
  - `endTime` (String HH:MM format) - Session end time
  - `isBooked` (Boolean) - Booking status
  - `bookedBy` (ObjectId) - User who booked (if booked)
  - `createdAt` (Date) - Creation timestamp

- **Validation**:
  - End time must be after start time
  - Prevents overlapping time slots
  - Only unbooked slots can be modified or deleted

- **Routes**: `backend/routes/availability/availabilityRoutes.js`
  - `GET /api/availability` - Get user's slots (with date range filters)
  - `POST /api/availability` - Create new slot
  - `PUT /api/availability/:id` - Update slot (if not booked)
  - `DELETE /api/availability/:id` - Delete slot (if not booked)
  - `GET /api/availability/user/:userId` - View another user's available slots
  - `POST /api/availability/:id/book` - Book a time slot

### Frontend

- **Components**:
  - `client/features/availability-management/frontend/components/AvailabilityManager.jsx`
    - View all availability slots with calendar-like display
    - Add/Edit/Delete time slots
    - Visual distinction for booked slots

- **Services**: `client/features/availability-management/frontend/services/availabilityApi.js`

- **Pages**: `client/features/availability-management/frontend/pages/AvailabilityPage.jsx`

- **Route**: `/availability` - Availability management page in navbar

### Usage

1. Navigate to **Availability** in navbar
2. Click "Add Slot" to create new availability
3. Select date and time range (e.g., 2024-04-20, 14:00 - 15:30)
4. View all your slots with edit/delete options
5. Booked slots are highlighted and cannot be modified
6. Other users can view your available slots when searching

### Time Slot Conflict Prevention

- Automatically checks for overlapping time slots
- Returns error if new slot conflicts with existing ones
- Example: Can't create 14:00-15:00 if 14:30-15:30 exists

---

## 📊 Feature Integration Summary

| Feature       | Backend Models | Backend Routes        | Frontend Components     | Status |
| ------------- | -------------- | --------------------- | ----------------------- | ------ |
| Chat System   | ChatMessage    | /api/chat/\*          | Chat, ChatList          | ✅     |
| Reviews       | Review         | /api/reviews/\*       | ReviewForm, ReviewsList | ✅     |
| Notifications | Notification   | /api/notifications/\* | Service only            | ✅     |
| Availability  | Availability   | /api/availability/\*  | AvailabilityManager     | ✅     |

---

## 🔗 Frontend Navigation

All features are integrated into the main navbar:

```
Dashboard → Skills → Find Partners → Messages → Availability → Wallet → Buy Credits → Challenges
```

**Quick Access via Routes**:

- `/dashboard` - Main dashboard
- `/skills` - Skill management
- `/search` - Find learning partners
- `/chat` - Messages page
- `/availability` - Manage time slots
- `/wallet` - Credit wallet
- `/payment` - Purchase credits
- `/challenges` - Skill challenges

---

## 🛠️ Technical Stack

### Backend

- **Express.js** - REST API server
- **Socket.io** - Real-time chat
- **MongoDB** - Data persistence
- **Mongoose** - ODM/Schema validation
- **JWT** - Authentication

### Frontend

- **React 18** - UI framework
- **React Router v6** - Navigation
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Firebase SDK** - Push notifications (ready to integrate)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../client
npm install --legacy-peer-deps  # For React compatibility
```

### 2. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Runs on port 5000

# Terminal 2 - Frontend
cd client
npm run dev  # Runs on http://localhost:5173
```

### 3. Test Features

- Open http://localhost:5173 in browser
- Register two test accounts
- Test each feature using the navigation

---

## 📝 API Examples

### Chat

```bash
# Get conversations
GET /api/chat/conversations
Authorization: Bearer <token>

# Send message via Socket.io
socket.emit('sendMessage', {
  senderId: '<userId>',
  receiverId: '<userId>',
  message: 'Hello!',
  timestamp: new Date()
})
```

### Reviews

```bash
# Submit review
POST /api/reviews
{
  "targetUserId": "<userId>",
  "rating": 5,
  "comment": "Great teacher!"
}

# Get user reviews
GET /api/reviews/user/<userId>
```

### Availability

```bash
# Create slot
POST /api/availability
{
  "date": "2024-04-20",
  "startTime": "14:00",
  "endTime": "15:30"
}

# Book slot
POST /api/availability/<slotId>/book
```

### Notifications

```bash
# Get notifications
GET /api/notifications?page=1&limit=20&unreadOnly=false

# Mark as read
POST /api/notifications/mark-read/<id>
```

---

## 🔐 Security & Best Practices

1. **Authentication**: All routes protected with JWT middleware
2. **Authorization**: Users can only access their own data
3. **Validation**: Input validation on all endpoints
4. **Error Handling**: Proper HTTP status codes and error messages
5. **Socket.io**: Authentication via JWT tokens

---

## 🐛 Troubleshooting

### Chat not working

- Check Socket.io connection: open DevTools Console
- Verify JWT token is valid: `localStorage.getItem('token')`
- Ensure both servers are running

### Reviews not updating

- Clear browser cache and reload
- Check UserProfile model for rating/totalReviews fields

### Availability conflicts

- Ensure time format is HH:MM (24-hour)
- Check date is valid and in future
- Verify no overlapping slots exist

---

## 📚 Next Steps

1. **Firebase Setup**: Configure Firebase Cloud Messaging for push notifications
2. **Email Integration**: Add email notifications for reviews
3. **Session Booking**: Link availability slots to actual sessions
4. **Payment Integration**: Connect availability to wallet deductions
5. **Search Optimization**: Add availability as filter in user search

---

## 👥 Team Assignments

- **Member 1**: Real-Time Chat System ✅
- **Member 2**: Rating and Review System ✅
- **Member 3**: Push Notification System ✅
- **Member 4**: Availability Management System ✅

All features are fully implemented and integrated!
