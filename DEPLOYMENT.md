# Deployment Guide

AI LifeOS uses a decoupled architecture. The frontend is built with Vite (deployed to Vercel) and the backend is a Node.js API (deployed to Render). 

## 1. Backend Deployment (Render)

1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository and set the Root Directory to `server`.
3. Set the following build and start commands:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Configure Environment Variables in the Render dashboard:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`
   - `JWT_SECRET=your_super_secret_key`
   - `GROQ_API_KEY=gsk_...`
   - `GEMINI_API_KEY=AIza...`
   - `CLIENT_URL=https://your-frontend-app.vercel.app` (Important: Must exactly match your Vercel URL to prevent CORS errors)
   - `GOOGLE_CLIENT_ID=...` (Optional, for OAuth)
   - `GOOGLE_CLIENT_SECRET=...` (Optional)

## 2. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and create a new Project.
2. Connect your GitHub repository and set the Root Directory to `client`.
3. Vercel will automatically detect the Vite framework and apply default build settings.
4. Add the following Environment Variables in the Vercel dashboard:
   - `VITE_GOOGLE_CLIENT_ID=...`
5. **Proxy Configuration:**
   Ensure `client/vercel.json` exists with the following configuration. This securely routes `/api/*` traffic from your frontend domain directly to your backend on Render.
   
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-backend-app.onrender.com/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Important Production Notes
- Do **not** hardcode your backend URL into `VITE_API_URL` for production on Vercel. The `vercel.json` rewrite handles this automatically, preventing mixed-content and CORS preflight issues.
- Render's free tier spins down after inactivity. The first API request may take up to 50 seconds to complete. Consider upgrading to a paid tier for instant responses.
