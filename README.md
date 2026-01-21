# 🚀 Automated Data Labeling Dashboard

A full-stack MERN application that automatically labels text data using AI. Users can upload text or CSV datasets, review AI-generated labels, override them manually, and track labeling progress in a web dashboard.

## 🛠️ Tech Stack

- **Frontend:** React.js, Ant Design
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** OpenAI API

## ✨ Features

- ✅ Auto-label text using AI
- ✅ Upload CSV datasets
- ✅ Review, approve, and override labels
- ✅ Real-time labeling statistics
- ✅ MongoDB data storage

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URL=your_mongodb_url
OPENAI_API_KEY=your_api_key
```

Run:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables

### Frontend (Netlify)
1. Connect GitHub repo to Netlify
2. Base Directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `frontend/dist`

## 👨‍💻 Author

Rutvik Vana
