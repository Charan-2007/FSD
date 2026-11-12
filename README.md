# PharmaFlow - Pharmacy Inventory Management Web Service (MERN)

A full-stack MERN application for managing pharmacy stock, medicines, batches, low-stock warnings, and expiration tracking, structured for deployment on **Render**.

---

## 🚀 Architecture

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), CORS, Dotenv
- **Frontend**: React, Vite, Lucide Icons
- **Production Deployment**: Render (Unified Web Service serving the React SPA and REST API)

---

## 📁 Project Structure

```
FSD/
├── client/                 # React (Vite) Frontend Application
│   ├── src/
│   │   ├── App.jsx         # Main Inventory Dashboard & Modal Forms
│   │   ├── index.css       # Clean Pharmacy UI Theme & Responsive Grid
│   │   └── main.jsx
│   ├── vite.config.js      # Proxy configured for dev
│   └── package.json
├── models/
│   └── Medicine.js         # Mongoose schema for medicines & batches
├── routes/
│   └── medicineRoutes.js   # CRUD & statistics analytics endpoints
├── .env.example            # Sample environment variables
├── package.json            # Root scripts & build pipeline for Render
├── render.yaml             # Render Blueprint configuration
├── server.js               # Express server entry point & static distributor
└── README.md
```

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Setup Environment Variables
Create a `.env` file in the root folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pharmacy_inventory
NODE_ENV=development
```

### 3. Install & Run
In the root directory:
```bash
# Install dependencies & run backend
npm run build
npm start
```
Or run client & server separately:
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Client
cd client
npm run dev
```

---

## ☁️ Deploying to Render

### Option A: Via Blueprint (`render.yaml`)
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete MERN pharmacy inventory service"
   git push origin main
   ```
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository (`Charan-2007/FSD`).
5. Render will automatically detect `render.yaml`. Set the `MONGO_URI` secret environment variable (e.g. from MongoDB Atlas).

### Option B: Manual Web Service
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Select your repository.
3. Configure the following:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmacy?retryWrites=true&w=majority`
5. Click **Deploy Web Service**.
