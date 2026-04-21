# Persistent Database Setup

## Overview

The application has been updated to use **persistent local MongoDB** instead of an in-memory database. This means your data will **survive server restarts**.

## Prerequisites

### Windows Users

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Version: 8.2.1 or later
   - During installation, select "Install as a Service" (recommended)

2. **Verify MongoDB is Running**
   - MongoDB should start automatically as a Windows Service
   - Check Services (services.msc) for "MongoDB Server"
   - Or start it manually: `net start MongoDB`

3. **Verify Connection**
   ```bash
   mongosh
   # You should see a MongoDB shell prompt
   # Type: exit
   ```

### Mac/Linux Users

```bash
# Install MongoDB with Homebrew (Mac)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or manually
mongod --dbpath /usr/local/var/mongodb
```

## Configuration

The MongoDB connection is configured in:

- **File:** `backend/.env`
- **Setting:** `MONGO_URI=mongodb://localhost:27017/skillswap`

### Alternative: Use MongoDB Atlas (Cloud)

If you prefer not to install MongoDB locally, use MongoDB Atlas:

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (e.g., `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/skillswap`)
4. Update `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/skillswap
   ```

## Running the Application

1. **Ensure MongoDB is running:**

   ```bash
   mongosh
   # or check Windows Services
   ```

2. **Start the backend:**

   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

## Features

✅ **Data Persists** - Messages, users, notifications survive server restarts
✅ **Auto-Seed** - Database seeds with test data on first run
✅ **No Setup** - Uses localhost MongoDB by default (if installed)
✅ **Cloud Ready** - Can easily switch to MongoDB Atlas for production

## Test Accounts (First Run)

After first server start, these accounts are automatically created:

- `test@skillswap.com` / `123456`
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `carol@example.com` / `password123`
- `david@example.com` / `password123`
- `emma@example.com` / `password123`

## Troubleshooting

### "Connection refused" Error

- MongoDB is not running
- **Windows:** Check Services or run `net start MongoDB`
- **Mac/Linux:** Run `brew services start mongodb-community` or `mongod`

### Database keeps resetting

- Delete `backend/package-lock.json` and `node_modules`
- Run `npm install` again
- Verify `MONGO_URI` in `.env`

### Want to reset database (optional)

```bash
# Connect to MongoDB
mongosh
# Select database and drop it
use skillswap
db.dropDatabase()
exit
# Restart server (will reseed)
```

## Environment Variables

```env
# Connection string for persistent MongoDB
MONGO_URI=mongodb://localhost:27017/skillswap

# JWT secret for authentication
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Environment
NODE_ENV=development

# Client origin
CLIENT_ORIGIN=http://localhost:5173
```
