🧠 Thinkify – Where Ideas Thrive
Thinkify is a collaborative platform designed to spark meaningful conversations, promote knowledge sharing, and foster a diverse and inclusive digital community. Whether you're a student, teacher, or admin, Thinkify offers personalized tools to share content, manage tasks, and engage constructively.

🔍 Project Overview
Thinkify is more than just a discussion hub — it's a micro social ecosystem tailored for educational institutions. With role-based dashboards, content publishing, assignments, polls, and resource management features, Thinkify empowers users to connect, contribute, and grow.



🖼️ Preview:


🚀 Getting Started
Prerequisites
Node.js (v16+ recommended)

MongoDB (local or Atlas)

Installation Steps

# Clone the repository
git clone 

# Backend setup
cd server
npm install
npx nodemon index.js

# Frontend setup
cd ../client
npm install
npm run dev

🔐 Configuration
Frontend (client/.env)
env

VITE_TOKEN_KEY=thinkify
VITE_USER_ROLE=role
VITE_COOKIE_EXPIRES=1

Backend (server/.env)
env

PORT=3000
DATABASE_URL=mongodb://localhost:27017/
DATABASE_NAME=thinkify
BCRYPT_GEN_SALT_NUMBER=10
JWT_SECRET_KEY=your_jwt_secret
COOKIE_EXPIRES=5d
COOKIE_KEY=thinkify
UPLOAD_DIRECTORY=uploads

✨ Key Features
🛠 Admin Capabilities
Access analytics (user activity, role-based distribution)

Manage users

Secure sign-out

🎓 Student Dashboard
Create and manage posts and products

Personal task manager

Account settings (password update)

Profile management

🏫 Institution/Teacher Panel

Publish announcements and posts (text/image)

Create assignments with deadlines and marking

Conduct polls (single/multiple choice, anonymous)

Share educational resources (links, files)

Organize quizzes/tests

📌 Feature Roadmap & Enhancements

🔐 Google OAuth integration

🛍 Dedicated product view page

📋 Detailed task & user view pages

✏️ Edit functionality for posts, products, and user profiles

⏳ Unified loading and skeleton components

🧩 UI Design Blueprint (Conceptual)

|------------------|-----------------------------|-------------|
| Navigation Menu  | Content Creation Workspace  | Analytics   |
|------------------|-----------------------------|-------------|
| Institution/Role | Post Creation | Task Panel | Courses     |
| Pages            | Assignments   | Polls      | Users       |
|------------------|-----------------------------|-------------|

📂 Data Models
Assignments
title, description, subject, deadline, totalMarks, status, audience

Polls
title, description, type, options, deadline, isAnonymous, audience

Resources
title, description, url, visibility, audience

