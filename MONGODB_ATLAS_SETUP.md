# MongoDB Atlas Setup Guide (5 Minutes)

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up Free"**
3. Create an account with your email
4. Verify your email

## Step 2: Create a Free Cluster

1. After signing up, click **"Create a Deployment"**
2. Select **"M0 Free"** (it's free forever)
3. Choose your cloud provider (AWS, Google Cloud, or Azure - any works)
4. Select a region closest to you
5. Click **"Create Deployment"**
   - Wait 2-3 minutes for the cluster to be created

## Step 3: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Enter:
   - **Username:** `skillswap`
   - **Password:** Create a strong password (copy it somewhere safe!)
4. Click **"Add User"**

## Step 4: Allow Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (for development)
   - It will add `0.0.0.0/0` to allow all IPs
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Clusters"** or **"Deployments"**
2. Click your cluster (named something like "Cluster0")
3. Click **"Connect"**
4. Select **"Drivers"**
5. Choose **"Node.js"** driver
6. Copy the connection string (looks like):
   ```
   mongodb+srv://skillswap:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your `.env` File

Open `backend/.env` and replace the `MONGO_URI` line:

```env
MONGO_URI=mongodb+srv://skillswap:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
```

**Replace:**

- `YOUR_PASSWORD` - with the password you created in Step 3
- `cluster0.xxxxx.mongodb.net` - with your actual cluster URL from Step 5

### Example:

```env
# Before (local MongoDB):
MONGO_URI=mongodb://localhost:27017/skillswap

# After (MongoDB Atlas):
MONGO_URI=mongodb+srv://skillswap:MySecurePass123@cluster0.abcde.mongodb.net/skillswap?retryWrites=true&w=majority
```

## Step 7: Restart Backend Server

1. Stop the backend if it's running (Ctrl+C in terminal)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```
3. You should see: `MongoDB connected` ✅

## Testing the Connection

Once the server starts, look for:

```
Connecting to MongoDB at: mongodb+srv://skillswap:***@cluster0...
Server running on port 5000
MongoDB connected
Database seeded successfully!
```

If you see these messages, **you're all set!** 🎉

## Important Notes

✅ **Your data will persist** - Even if you restart the server
✅ **Free forever** - MongoDB Atlas M0 tier is completely free
✅ **Accessible anywhere** - You can access from any IP (with the network access settings above)
⚠️ **Keep password private** - Don't commit `.env` to GitHub

## Troubleshooting

### Connection Refused

- Check you copied the connection string correctly
- Verify username and password are correct in the string
- Make sure network access allows your IP (0.0.0.0/0)

### Still connecting...

- MongoDB Atlas clusters can take a few minutes to start
- Wait 5 minutes and try restarting the server

### Wrong password

- Go to Database Access
- Click "Edit" on your user
- Click "Edit Password" and create a new one
- Update `.env` with new password

## MongoDB Atlas Dashboard

Once connected, you can view your data at:

1. Go to Atlas dashboard
2. Click your cluster
3. Click **"Collections"** to see all your data
4. Messages, Users, Notifications, etc. will be stored here
