# Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (already set up ✅)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update with your MongoDB credentials (already configured ✅)

3. **Start Backend Server**
   ```bash
   node server.js
   ```
   Expected: `✅ MongoDB Connected: MongoDB Atlas`

4. **Start Frontend (in new terminal)**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:5173

---

## ☁️ Deployment Options

### Option 1: Vercel + Render (Recommended - Free)

#### Frontend (Vercel)
1. Push code to GitHub
2. Visit https://vercel.com/new
3. Import your GitHub repo
4. Vercel auto-detects Vite
5. Deploy! ✅

#### Backend (Render)
1. Visit https://render.com/
2. New → Web Service
3. Connect GitHub repo
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. **Environment Variables**:
   - `MONGODB_URI` = `mongodb+srv://riturajjhacg_db_user:Ha0ck%40%23%26er@cluster0.gritxst.mongodb.net/study_planner?retryWrites=true&w=majority`
7. Deploy! Backend URL will be: `https://your-app.onrender.com`

#### Connect Frontend to Backend
1. In Vercel, add environment variable:
   - `VITE_API_URL` = `https://your-app.onrender.com`
2. Update frontend API calls to use `import.meta.env.VITE_API_URL`

---

### Option 2: AWS Amplify (Requires AWS Account)

#### Setup
```bash
npm install -g @aws-amplify/cli
amplify configure
amplify init
amplify add hosting
amplify publish
```

---

## 🔒 Security Checklist

- ✅ `.env` in `.gitignore`
- ✅ MongoDB password URL-encoded
- ✅ Using environment variables
- ⚠️ **TODO**: Add rate limiting (optional)
- ⚠️ **TODO**: Add CORS whitelist for production

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for all IPs)
- Check password special characters are URL-encoded

### CORS Error
- Add your frontend URL to CORS whitelist in `server.js`

---

## 📊 Current Status

- ✅ MongoDB Atlas connected
- ✅ Environment variables configured
- ✅ Backend ready for deployment
- ✅ Frontend ready for deployment
