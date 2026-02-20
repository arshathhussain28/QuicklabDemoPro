# QuickLab Demo Pro 🚀

A professional Medical Device Demo Management system designed for QuickLab Asia Pvt Ltd. This application streamlines the process of requesting kit demos, tracking commercial potential, and maintaining medical equipment configuration records.

## ✨ Features

- **Sequential Request Tracking**: Advanced ID generation (e.g., `100001`, `200001`) that persists across user sessions.
- **Professional PDF Generation**: Multi-page A4 PDF export with automated grid layouts and branding.
- **Sales Team Management**: Admin panel to monitor and manage salesperson activity.
- **Mobile Responsive**: Fully optimized for mobile devices for sales teams on the move.
- **Persistence**: Built with an Express/SQLite backend ensuring reliable data storage.

## 🛠️ Tech Stack

- **Frontend**: Vite, React, TailwindCSS, Radix UI.
- **Backend**: Node.js, Express, Prisma (SQLite).
- **PDF**: jsPDF, html2canvas.

## 🚀 Deployment

### Backend (Render.com)
1. Link this repository to **Render.com** as a **Blueprint**.
2. Render will automatically use `render.yaml` to set up the Web Service and Persistent Disk.

### Frontend (Vercel)
1. Import this repository into **Vercel**.
2. Set the Environment Variable:
   - `VITE_API_URL`: `https://your-render-app-url.onrender.com/api`
3. Deploy!

## 📦 Setup & Installation

1. Clone the repo: `git clone https://github.com/arshathhussain28/Quicklab-Demo-Pro.git`
2. Install dependencies: `npm install && cd server && npm install`
3. Run locally: `npm run dev:all`

---
© 2026 QuickLab Asia Pvt Ltd. All rights reserved.
