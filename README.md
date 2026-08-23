# Driving School Platform - Frontend

## Overview of the Problem We Solve

The Driving School Platform is designed to modernize and streamline the operations of driving schools. It provides a centralized system to manage student enrollments, mentor assignments, course curriculum, scheduling, attendance, and task grading. It ensures a seamless digital experience for students, mentors, and administrators to interact with the platform.

## Project Architecture

The frontend is designed with decoupled data and UI layers:

- **Stack**: React 18, TypeScript, Vite, Tailwind CSS, React Context, react-router-dom
- **State Management**: React Context + `useReducer` organized by domain (no external state libraries).
- **Service Layer**: A dedicated service interface layer (`src/services`) allowing seamless switching between mock data and the real API backend.
- **Styling**: Tailwind CSS configured with CSS variables (`theme/tokens.css`) for consistent design tokens.

## How to Set Up and Run

### Prerequisites

- Node.js (v18+)

### Setup Instructions

1. **Clone the repository** and navigate to the frontend directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Copy the example environment file and configure your API base URL (and toggle mock services if needed).
   ```bash
   cp .env.example .env
   ```
4. **Run the Application**:
   Start the Vite development server:
   ```bash
   npm run dev
   ```

## The Team

- **Zeamanuel Mebit** (ID: CTC-3498-26) - Lead, Code Reviewer
- **Yonas** (ID: [id]) - Backend dev
- **Yeabsra** (ID: [id]) - Frontend dev
- **Yohannes** (ID: [id]) - UI/UX designer, frontend dev
