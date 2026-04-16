# NOTESTACK - Student Note Sharing Platform

A complete production-ready MERN stack application for secure student note sharing with admin moderation, role-based access, PDF upload system, rating system, and real-time notifications.

## 🚀 Features

### Core Features
- ✅ **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- ✅ **Role-Based Access Control** - Student and Admin roles with protected routes
- ✅ **PDF Upload System** - Upload and share PDF notes with validation
- ✅ **Admin Moderation** - All notes require admin approval before publication
- ✅ **Advanced Search** - Search notes by title, subject, and description
- ✅ **Embedded PDF Viewer** - Preview notes directly in browser
- ✅ **Download Tracking** - Track download counts for popularity metrics
- ✅ **5-Star Rating System** - Rate and review notes with optional comments
- ✅ **Real-Time Notifications** - Socket.io powered admin notifications
- ✅ **Smart Ranking Algorithm** - Rank notes based on ratings, downloads, and recency
- ✅ **Contribution Score System** - Earn points for uploading quality notes
- ✅ **Trending Notes** - Discover the most popular notes
- ✅ **Responsive Design** - Works seamlessly on all devices

### Premium Features
- 🎨 **Modern Animations** - Framer Motion and AOS animations
- 🎭 **Glassmorphism UI** - Beautiful glass-effect design
- 🌈 **Gradient Backgrounds** - Eye-catching color schemes
- ⚡ **Fast Performance** - Optimized for speed
- 🔒 **Security Headers** - Helmet.js for enhanced security
- 🚦 **Rate Limiting** - Prevent API abuse

## 📁 Project Structure

```
NOTESTACK_MERN/
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── seedAdmin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── ratingController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Rating.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── notificationRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LandingPage.css
│   │   │   ├── AboutPage.js
│   │   │   ├── AboutPage.css
│   │   │   ├── FeaturesPage.js
│   │   │   ├── FeaturesPage.css
│   │   │   ├── ContactPage.js
│   │   │   ├── ContactPage.css
│   │   │   ├── SignupPage.js
│   │   │   ├── SignupPage.css
│   │   │   ├── LoginPage.js
│   │   │   ├── LoginPage.css
│   │   │   ├── Dashboard.js
│   │   │   ├── Dashboard.css
│   │   │   ├── AdminDashboard.js
│   │   │   └── AdminDashboard.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Local: mongodb://localhost:27017/notestack)
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload
- **Socket.io** - Real-time notifications
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **AOS** - Scroll animations
- **React Toastify** - Notifications
- **React Icons** - Icon library
- **Socket.io Client** - Real-time updates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (Running locally on port 27017)
- **npm** or **yarn**

## 🚀 Installation & Setup

### Step 1: Clone or Navigate to Project Directory

```bash
cd "d:\Desktop files\projects of collage\NOTESTACK_MERN"
```

### Step 2: Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create admin account
npm run seed

# Start the server
npm run dev
```

The backend server will start on **http://localhost:5000**

### Step 3: Setup Frontend (Open New Terminal)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the React app
npm start
```

The frontend will start on **http://localhost:3000**

## 🔐 Admin Credentials

**Email:** amankarn.2024cse@sece.ac.in  
**Password:** Asha530680@

## 📝 Usage Guide

### For Students:

1. **Sign Up** - Create an account with name, email, contact, and password
2. **Login** - Access your dashboard
3. **Upload Notes** - Upload PDF files with title, subject, and description
4. **Search Notes** - Find approved notes by title or subject
5. **View & Download** - Preview PDFs and download them
6. **Rate Notes** - Give 1-5 star ratings with optional comments
7. **Track Contribution** - View your contribution score

### For Admin:

1. **Login** - Use admin credentials
2. **View Dashboard** - See statistics and notifications
3. **Review Notes** - Approve or reject pending notes
4. **Manage Content** - Delete inappropriate notes
5. **Monitor Activity** - Track uploads and user activity

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Notes
- `POST /api/notes/upload` - Upload note (Protected)
- `GET /api/notes` - Get approved notes (Protected)
- `GET /api/notes/search` - Search notes (Protected)
- `GET /api/notes/trending` - Get trending notes (Protected)
- `GET /api/notes/:id` - Get single note (Protected)
- `PUT /api/notes/:id/download` - Increment download (Protected)
- `GET /api/notes/admin/all` - Get all notes (Admin)
- `PUT /api/notes/:id/approve` - Approve/Reject note (Admin)
- `DELETE /api/notes/:id` - Delete note (Admin)

### Ratings
- `POST /api/ratings` - Submit rating (Protected)
- `GET /api/ratings/:noteId` - Get note ratings (Protected)
- `GET /api/ratings/check/:noteId` - Check user rating (Protected)

### Notifications
- `GET /api/notifications` - Get all notifications (Admin)
- `GET /api/notifications/unseen/count` - Get unseen count (Admin)
- `PUT /api/notifications/:id/seen` - Mark as seen (Admin)
- `PUT /api/notifications/seen/all` - Mark all as seen (Admin)

## 🎨 Design Features

### Animations
- Fade-in effects on page load
- Slide-up animations for cards
- Hover scale effects
- Pulse animations for buttons
- Floating elements
- Smooth transitions

### Color Scheme
- Primary: #667eea (Purple Blue)
- Secondary: #764ba2 (Purple)
- Accent: #ffd700 (Gold)
- Dark: #1a1a2e (Navy)

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based authorization
- Input validation
- File type validation (PDF only)
- Rate limiting
- Security headers with Helmet
- CORS enabled

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  contact: String,
  password: String (hashed),
  role: String (student/admin),
  contributionScore: Number,
  createdAt: Date
}
```

### Notes Collection
```javascript
{
  title: String,
  subject: String,
  description: String,
  fileUrl: String,
  uploadedBy: ObjectId (ref: User),
  status: String (Pending/Approved/Rejected),
  downloads: Number,
  avgRating: Number,
  rankScore: Number,
  createdAt: Date
}
```

### Ratings Collection
```javascript
{
  userId: ObjectId (ref: User),
  noteId: ObjectId (ref: Note),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### Notifications Collection
```javascript
{
  noteId: ObjectId (ref: Note),
  studentId: ObjectId (ref: User),
  message: String,
  seen: Boolean,
  createdAt: Date
}
```

## 🚀 Deployment

### Backend (Render/Heroku)
1. Push code to GitHub
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build the app: `npm run build`
2. Deploy build folder
3. Update API URLs

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Update MONGODB_URI in .env
3. Whitelist IP addresses

## 👨‍💻 Developer

**Name:** Aman Karn  
**Email:** amankarn.2024cse@sece.ac.in  
**Project:** NOTESTACK - Student Note Sharing Platform  
**Institution:** SECE (Sri Eshwar College of Engineering)

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

- MongoDB for database
- React.js for frontend
- Express.js for backend
- Framer Motion for animations
- All open-source contributors

---

**Made with ❤️ by Aman Karn**

For any queries or issues, please contact: amankarn.2024cse@sece.ac.in
