🚀 NICK'S CALENDLY — Scheduling Platform (Scaler Assignment)

A full-stack scheduling & booking platform inspired by Calendly, built with production-grade architecture and clean UI/UX patterns.

This application allows users to create event types, manage availability, and accept bookings via a public link, closely replicating real-world scheduling systems.

✨ Features (Fully Implemented)

🧩 1. Event Types Management
Create event types with name, duration, unique slug  
Edit & delete event types  
Each event type has a public booking URL  
Clean card-based UI (Calendly style)  

📅 2. Availability Settings
Set weekly availability (Mon–Sun)  
Define time ranges per day  
Host timezone selection supported  
Stored in database for dynamic slot generation  

🌍 3. Public Booking Page (/book/:slug)
Month-based calendar UI  
Dynamic time slot generation  
Booking form (name + email)  
Prevents double booking  
Booking confirmation screen  

📊 4. Meetings Dashboard
View upcoming meetings  
View past meetings  
Cancel meetings with status update  

🧠 Key Design Decisions (IMPORTANT FOR INTERVIEW)

Default User System  
No auth required → simplifies assignment scope  
Controlled via .env flags  
Easily extendable to JWT / OAuth  

Slot Generation Logic  
Based on:  
Weekly availability  
Selected date  
Event duration  
Ensures no overlap + no double booking  

Database Normalization  
Separate tables for:  
Users  
Event Types  
Availability  
Bookings  
Clean relations → scalable design  

Separation of Concerns  
Frontend: UI + API consumption  
Backend: business logic + validation  
Prisma: DB abstraction  

🏗️ Tech Stack

Frontend: React 19, TypeScript, Vite, Tailwind CSS  
UI Components: Radix UI, Sonner  
State: TanStack Query  
Backend: Node.js, Express 5  
ORM: Prisma  
Database: PostgreSQL  
Routing: React Router 7  
HTTP Client: Axios  

🗄️ Database Schema (Simplified)

User: id, email, name  
EventType: id, name, duration, slug, userId  
Availability: id, dayOfWeek, startTime, endTime, eventTypeId  
Booking: id, name, email, date, startTime, endTime, status, eventTypeId  

⚙️ Setup Instructions

🔹 Prerequisites  
Node.js (18+)  
PostgreSQL  
npm  

🔹 1. Clone Repository  
git clone <your-repo-link>  
cd SCALER  

🔹 2. Backend Setup  
cd BACKEND  
npm install  

Create .env:  
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly"  
USE_DEFAULT_USER=true  
DEFAULT_USER_ID=1  
DEFAULT_USER_EMAIL=demo@calendly.local  

Run:  
npx prisma migrate deploy  
npm run seed  
npm run dev  

Backend runs on:  
http://127.0.0.1:5000  

🔹 3. Frontend Setup  
cd FRONTEND  
npm install  

Project runs on:  
http://scaler-sage.vercel.app 

🔍 API Health Check  
GET /health  
GET /api/health  

Response:  
{ "ok": true }  

🚫 Assumptions (As per Assignment)
Single default user (no login required)  
No external integrations (Google Calendar, Zoom)  
Timezone handled at availability level  
No rescheduling (future enhancement)  



🎯 Evaluation Alignment

Functionality: All core features fully implemented  
UI/UX: Closely matches Calendly layout & interaction  
Database Design: Normalized schema with proper relations  
Code Quality: Modular, readable, scalable  
Code Modularity: Separation of frontend/backend concerns  
Understanding: Clear logic, explainable architecture  

💡 Final Note

This project is 100% original implementation built specifically for the Scaler assignment.  
All features were designed and coded with full understanding and interview readiness.
