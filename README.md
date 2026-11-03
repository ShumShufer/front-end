# ShumShufer (ሹም ሹፌር) — Driving School Management & Learning Platform (Frontend)

[![Production Status](https://img.shields.io/badge/Production-Ready-brightgreen)](https://github.com/ShumShufer)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passing-success)](https://github.com/ShumShufer)
[![License](https://img.shields.io/badge/License-ISC-blue)](https://github.com/ShumShufer)

A full-stack, enterprise-grade driving school management and digital learning platform specifically tailored for Ethiopia. It integrates national identity verification (**Fayda**), online payments (**Chapa**), dynamic multi-role workspaces, automated background jobs, and hierarchical scheduling.

---

## 📌 Project Submission Overview

> **Mentor & Evaluator Notice:** This section provides direct links and details satisfying all CTC submission requirements.

### 1. 🔗 GitHub Repository Links & Live Demo
- **GitHub Organization**: [https://github.com/ShumShufer](https://github.com/ShumShufer)
- **Frontend Repository**: [https://github.com/ShumShufer/front-end](https://github.com/ShumShufer/front-end)
- **Backend Repository**: [https://github.com/ShumShufer/back-end](https://github.com/ShumShufer/back-end)
- **Live Deployed App**: [https://shumshufer-frontend.onrender.com/](https://shumshufer-frontend.onrender.com/)

### 2. 🎥 Video Presentation
- **Video Link**: [Watch Video Presentation on Google Drive](https://drive.google.com/file/d/1Xl9a9FJfkaYc-vbjFU5wXvKRdmVh7lBm/view?usp=sharing)
- **Voiceover & Walkthrough Script**: System Overview Script with complete role walkthroughs.

### 3. 📖 Project Information
- **Project Title**: **ShumShufer (ሹም ሹፌር)**
- **Purpose**: Modernize and streamline the Ethiopian driving school ecosystem by replacing fragmented, pen-and-paper school workflows with an all-in-one digital platform.
- **Key Modules & Features**:
  - **Fayda National ID Integration**: Automated biometric/QR identity verification ensuring valid, verified student registration.
  - **Chapa Payment Gateway**: Seamless tuition and course fee settlements with cryptographic webhook auditing.
  - **5 Role-Based Workspaces**: Tailored workflows for **Super Admin**, **School Admin**, **Education Head**, **Mentor**, and **Student**.
  - **Digital Learning & Quizzes**: Structured theory modules, daily chapter practice quizzes, task submissions, and automated grading.
  - **Hierarchical Scheduling**: Lock-out priority conflict resolution for vehicles, instructors, and theory classrooms.
  - **Cross-School Practice Agreements**: Inter-school agreements allowing students to complete practical driving sessions in different branches/locations.

### 4. 👥 Team Information

| Full Name | CTC ID | Role / Contribution |
|---|---|---|
| **Zeamanuel Mebit** | `CTC-3498-26` | Team Lead, System Architecture & Code Review |
| **Yonnas Kelem** | `CTC-3303-26` | Backend Developer (APIs, Prisma, Security & Scheduling) |
| **Yeabsira Mezgebu** | `CTC-2878-26` | Frontend Developer (Workspaces, Services & Responsive Layouts) |
| **Yohannes Belete** | `CTC-7823-26` | UI/UX Designer & Frontend Developer |

---

## 🚀 Quick Start (Production via Docker Compose)

The entire platform (PostgreSQL database, Express TypeScript API, and Nginx-powered React SPA) can be launched with a single command:

```bash
docker compose up --build -d
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
- **Backend API**: [http://localhost:3005/api/v1](http://localhost:3005/api/v1)
- **Health Check**: [http://localhost:3005/health](http://localhost:3005/health)

---

## 🔑 Demo & Evaluation Credentials

All seeded accounts share the default password: **`password123`**

| Role | Email | Scope / School | Key Capabilities to Test |
|---|---|---|---|
| **SUPER_ADMIN** | `superadmin@shumshufer.com` | Platform-wide | Platform KPIs, school approvals, cross-school commission overview, system broadcast announcements, Fayda audits |
| **ADMIN** | `admin@addisdriving.com` | Addis Driving Academy | School profile & branches, dynamic application form builder, student enrollment inbox, staff hiring, revenue reporting |
| **ADMIN** | `admin@boledriving.com` | Bole Driving School | Multi-branch operations, inter-school agreement proposals & practice request approvals |
| **EDUCATION_HEAD** | `edhead@addisdriving.com` | Addis Driving Academy | Master scheduling (locks against lower ranks), curriculum oversight, quiz builder |
| **MENTOR** | `mentor1@addisdriving.com` | Addis Driving Academy | Classroom hub, daily attendance marking, task creation & grading, course final exam result publishing |
| **STUDENT** | `student1@gmail.com` | Addis Driving Academy | Video course player, daily practice quizzes, task submissions, progress report, practice-elsewhere requests |

---

## 🏗️ Architecture & Technology Stack

### Frontend (`/front-end`)
- **Library & Framework**: React 19, Vite 8, React Router v7
- **Styling**: Tailwind CSS v4 with unified design tokens (`tokens.css`) and responsive layout
- **State Architecture**: Decoupled domain service layer (`src/services`) backed by React Context & `useReducer`
- **Mapping**: Interactive Leaflet maps for school & branch locations across Addis Ababa
- **Production Server**: Multi-stage Nginx container with gzip compression, security headers, and client-side history fallback

### Backend (`/back-end`)
- **Runtime & Language**: Node.js 22 LTS, TypeScript (ESM)
- **Framework**: Express 5.x
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Security**: JWT token rotation, bcrypt password hashing, Helmet security headers, Express rate limiting, strict Zod schema validation
- **Scheduler**: Autonomous background workers (`ScheduleReminderJob`, `ApplicationDeadlineJob`, `PriceRecalculationJob`)

---

## 🛠️ Local Development Setup

### Frontend Setup
```bash
cd front-end
npm install
cp .env.example .env
npm run lint           # Verifies zero ESLint errors & warnings
npm run build          # Builds optimized production client bundle
npm run dev            # Starts Vite development server on http://localhost:5173
```

---

## 👥 The Team

- **Zeamanuel Mebit** (ID: CTC-3498-26) — Lead, Code Reviewer, Architecture
- **Yonnas kelem** (ID: CTC-3303-26) — Backend Developer (APIs, Prisma, Security & Scheduling)
- **Yeabsra** (ID: CTC-2878-26) — Frontend Developer (Workspaces, Services & Responsive Layouts)
- **Yohannes** (ID: CTC-7823-26) — UI/UX Designer & Frontend Developer
