# 🚀 NOTESTACK - Complete Setup Guide

This guide will walk you through setting up the NOTESTACK project from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** installed (v14 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **MongoDB** installed and running
  - Check: `mongod --version`
  - Download: https://www.mongodb.com/try/download/community
  - Start MongoDB: `mongod` or start MongoDB service

- [ ] **npm** installed (comes with Node.js)
  - Check: `npm --version`

- [ ] **Git** installed (optional, for version control)
  - Check: `git --version`

## 🔧 Step-by-Step Setup

### Step 1: Verify MongoDB is Running

**Windows:**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
# Try connecting to MongoDB
mongosh
# OR
mongo
```

If successful, you'll see MongoDB shell. Type `exit` to quit.

### Step 2: Navigate to Project Directory

```bash
cd "d:\Desktop files\projects of collage\NOTESTACK_MERN"
```

### Step 3: Backend Setup

```bash
# Navigate to server folder
cd server

# Install all backend dependencies
npm install

# This will install:
# - express
# - mongoose
# - bcryptjs
# - jsonwebtoken
# - multer
# - cors
# - dotenv
# - express-validator
# - helmet
# - express-rate-limit
# - socket.io
```

**Wait for installation to complete (may take 2-3 minutes)**

### Step 4: Create Admin Account

```bash
# Run the seed script to create admin
npm run seed
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Admin created successfully
Email: amankarn.2024cse@sece.ac.in
Role: admin
```

If you see "Admin already exists", that's fine - it means the admin is already created.

### Step 5: Start Backend Server

```bash
# Start the development server
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
```

**Keep this terminal window open!** The server needs to keep running.

### Step 6: Frontend Setup (Open NEW Terminal)

**Open a NEW terminal/command prompt window**

```bash
# Navigate to project directory
cd "d:\Desktop files\projects of collage\NOTESTACK_MERN"

# Navigate to client folder
cd client

# Install all frontend dependencies
npm install

# This will install:
# - react
# - react-dom
# - react-router-dom
# - axios
# - framer-motion
# - aos
# - react-toastify
# - socket.io-client
# - react-icons
# - react-pdf
```

**Wait for installation to complete (may take 3-5 minutes)**

### Step 7: Start Frontend Application

```bash
# Start the React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view notestack-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Your browser should automatically open to http://localhost:3000**

## ✅ Verification

### Check if Everything is Working:

1. **Backend Check:**
   - Open: http://localhost:5000
   - You should see: `{"message":"Welcome to NOTESTACK API"}`

2. **Frontend Check:**
   - Open: http://localhost:3000
   - You should see the NOTESTACK landing page with video background

3. **Database Check:**
   ```bash
   # Open MongoDB shell
   mongosh
   
   # Switch to notestack database
   use notestack
   
   # Check if admin exists
   db.users.find({role: "admin"})
   
   # Exit
   exit
   ```

## 🎯 First Time Usage

### 1. Test Admin Login

1. Go to http://localhost:3000
2. Click "Login"
3. Enter:
   - **Email:** amankarn.2024cse@sece.ac.in
   - **Password:** Asha530680@
4. Click "Login"
5. You should be redirected to Admin Dashboard

### 2. Create Student Account

1. Click "Logout" (if logged in as admin)
2. Click "Signup"
3. Fill in the form:
   - Name: Your Name
   - Email: your.email@example.com
   - Contact: 1234567890
   - Password: password123
   - Confirm Password: password123
4. Click "Sign Up"
5. You should be redirected to Student Dashboard

### 3. Test Upload Feature

1. Login as student
2. Go to Dashboard
3. Fill in upload form:
   - Title: "Sample Note"
   - Subject: "Computer Science"
   - Description: "Test note"
   - Choose a PDF file
4. Click "Upload Note"
5. You should see success message

### 4. Test Admin Approval

1. Logout and login as admin
2. Go to Admin Dashboard
3. You should see the uploaded note in "Pending" status
4. Click the green checkmark to approve
5. Note status should change to "Approved"

### 5. Test Search Feature

1. Logout and login as student
2. Go to Dashboard
3. In search section, type the note title
4. Click "Search"
5. You should see the approved note

## 🐛 Troubleshooting

### Problem: MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Make sure MongoDB is running
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl start mongod
```

### Problem: Port 5000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Problem: Port 3000 Already in Use

**Solution:**
- The terminal will ask if you want to use another port
- Type `Y` and press Enter
- It will use port 3001 instead

### Problem: Module Not Found

**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Problem: CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Make sure backend is running on port 5000
- Check if `cors` is installed in server
- Restart both servers

### Problem: File Upload Not Working

**Solution:**
1. Check if `uploads` folder exists in server directory
2. Make sure you're selecting a PDF file
3. Check file size (max 10MB)

## 📱 Testing Checklist

- [ ] Landing page loads with video background
- [ ] Navigation works (About, Features, Contact)
- [ ] Signup creates new account
- [ ] Login works for both student and admin
- [ ] Student can upload PDF notes
- [ ] Admin receives notification
- [ ] Admin can approve/reject notes
- [ ] Student can search approved notes
- [ ] PDF viewer displays notes
- [ ] Download button works
- [ ] Rating system works
- [ ] Trending notes appear
- [ ] Logout works

## 🎨 Features to Test

### Student Features:
1. ✅ Upload notes with PDF
2. ✅ Search notes by title/subject
3. ✅ View PDF in browser
4. ✅ Download notes
5. ✅ Rate notes (1-5 stars)
6. ✅ Add comments to ratings
7. ✅ View trending notes
8. ✅ Track contribution score

### Admin Features:
1. ✅ View all notes
2. ✅ See pending notes
3. ✅ Approve notes
4. ✅ Reject notes
5. ✅ Delete notes
6. ✅ View notifications
7. ✅ Mark notifications as seen
8. ✅ View statistics

## 🚀 Production Deployment

### Backend Deployment (Render/Heroku):

1. Create account on Render.com or Heroku
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables:
   ```
   MONGODB_URI=<your_mongodb_atlas_uri>
   JWT_SECRET=notestack_super_secret_key_2024
   NODE_ENV=production
   ```
5. Deploy

### Frontend Deployment (Vercel/Netlify):

1. Build the app:
   ```bash
   cd client
   npm run build
   ```
2. Deploy `build` folder to Vercel/Netlify
3. Update API URL in `client/src/services/api.js`

### Database (MongoDB Atlas):

1. Create free cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP: 0.0.0.0/0 (allow from anywhere)
4. Get connection string
5. Update MONGODB_URI in backend

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Make sure MongoDB is running
4. Check console for error messages
5. Contact: amankarn.2024cse@sece.ac.in

## 🎉 Success!

If you've completed all steps and tests pass, congratulations! 🎊

Your NOTESTACK application is now fully functional and ready to use!

---

**Happy Coding! 💻**

Made with ❤️ by Aman Karn
