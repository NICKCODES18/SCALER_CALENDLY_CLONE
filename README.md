# 🚀 NICK'S CALENDLY — Scheduling Platform  
### *(Scaler SDE Intern Assignment — Production-Grade Clone)*

A **full-stack scheduling & booking platform** inspired by Calendly, built with **scalable architecture, clean UI/UX, and real-world system design principles**.

This application enables users to:
- Create event types
- Manage availability
- Share booking links
- Accept and manage meetings seamlessly

---

## 🌐 Live Application

- 🚀 **Live App:** http://scaler-sage.vercel.app  

---

## ✨ Core Features

### 🧩 Event Types Management
- Create events with **name, duration, unique slug**
- Edit & delete event types
- Public booking links for each event
- **Calendly-inspired UI (clean + minimal)**

---

### 📅 Availability System
- Weekly availability (Mon → Sun)
- Multiple time ranges per day
- Timezone-aware scheduling
- Stored in DB → **dynamic slot generation**

---

### 🌍 Public Booking Flow
- Route: \`/book/:slug\`
- Month-based calendar interface
- Smart time slot generation
- Booking form (name + email)
- **Prevents double booking**
- Confirmation screen after booking

---

### 📊 Meetings Dashboard
- View **upcoming meetings**
- View **past meetings**
- Cancel meetings (status update system)

---

## 🧠 System Design Highlights (Interview Gold)

### 🔹 Default User Architecture
- No authentication → simplified scope
- Controlled via \`.env\`
- Easily extendable to **JWT / OAuth**

---

### 🔹 Slot Generation Engine
Built using:
- Weekly availability
- Selected date
- Event duration  

✔ Ensures:
- No overlapping bookings  
- No duplicate slots  

---

### 🔹 Database Design (Normalized)
Separate tables:
- \`User\`
- \`EventType\`
- \`Availability\`
- \`Booking\`

✔ Benefits:
- Clean relations  
- Scalable schema  
- Easy feature expansion  

---

### 🔹 Clean Architecture
- **Frontend:** UI + API consumption  
- **Backend:** Business logic + validation  
- **Prisma:** ORM abstraction layer  

---

## 🏗️ Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS |
| UI          | Radix UI, Sonner |
| State       | TanStack Query |
| Backend     | Node.js, Express 5 |
| ORM         | Prisma |
| Database    | PostgreSQL |
| Routing     | React Router 7 |
| HTTP Client | Axios |

---

## 🗄️ Database Schema

\`\`\`ts
User:
id, email, name

EventType:
id, name, duration, slug, userId

Availability:
id, dayOfWeek, startTime, endTime, eventTypeId

Booking:
id, name, email, date, startTime, endTime, status, eventTypeId
\`\`\`

---

## ⚙️ Setup Guide

### 🔹 Prerequisites
- Node.js (18+)
- PostgreSQL
- npm

---

### 🔹 Backend Setup

\`\`\`bash
cd BACKEND
npm install
\`\`\`

Create \`.env\`:

\`\`\`env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly"

USE_DEFAULT_USER=true
DEFAULT_USER_ID=1
DEFAULT_USER_EMAIL=demo@calendly.local
\`\`\`

Run:

\`\`\`bash
npx prisma migrate deploy
npm run seed
npm run dev
\`\`\`

---

👉 LINK : http://scaler-sage.vercel.app  

---

## 🔍 API Health Check

\`\`\`
GET /health
GET /api/health
\`\`\`

Response:

\`\`\`json
{ "ok": true }
\`\`\`

---

## 🚫 Assumptions

- Single default user (no authentication)
- No external integrations (Google Meet / Zoom)
- Timezone handled at availability level
- No rescheduling (future scope)
---

## 🎯 Why This Project Stands Out

✔ Real-world problem solving  
✔ Clean & scalable architecture  
✔ Strong system design fundamentals  
✔ Fully functional end-to-end product  
✔ Built with **production mindset, not just assignment completion**

---

## 🧑‍💻 Author

**Nikunj Jain** 

---

## 💡 Final Note

This is a **complete, original implementation** built specifically for the Scaler assignment.

Every feature is:
- Thought through
- Properly implemented
- Interview-ready with clear explanations

---

⭐ *This is not just a project — it's a production-grade system.*
EOF
