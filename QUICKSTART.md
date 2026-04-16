# ⚡ NOTESTACK - Quick Start

## 🚀 Run the Application (After Setup)

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm start
```

## 🔐 Login Credentials

### Admin:
- **Email:** amankarn.2024cse@sece.ac.in
- **Password:** Asha530680@

### Student:
- Create your own account via Signup page

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017/notestack

## 📝 First Time Setup

If this is your first time running the project:

1. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   npm run seed
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Make sure MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

## ✅ Quick Test

1. Open http://localhost:3000
2. Click "Login"
3. Use admin credentials
4. You should see Admin Dashboard

## 📚 Full Documentation

For detailed setup instructions, see:
- **README.md** - Complete project documentation
- **SETUP_GUIDE.md** - Step-by-step setup guide

## 🐛 Common Issues

**MongoDB not running?**
```bash
net start MongoDB
```

**Port already in use?**
- Backend: Change PORT in server/.env
- Frontend: Terminal will ask to use different port

**Dependencies missing?**
```bash
npm install
```

---

**Need Help?** Contact: amankarn.2024cse@sece.ac.in
