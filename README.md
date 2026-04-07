PrepConnect
===========

PrepConnect is a student-focused preparation platform built with React and Vite.
It helps users explore shared interview experiences, browse company-specific prep
material, and access common subject-wise study resources.

Project Highlights
------------------

- Community feed for real interview experiences
- Protected share page for logged-in users
- Company-wise prep material section
- Study material section for common subjects like DSA, DBMS, OS, OOPs, etc.
- Admin dashboard for managing:
  - shared experiences
  - company prep material
  - subject-wise study material
- PDF-based interview question import for admin prep entries
- Floating chatbot UI
- Supabase-based authentication and database integration
- Optional Gemini API backend endpoint for AI responses

Tech Stack
----------

- React 19
- Vite 7
- React Router
- Supabase
- Framer Motion
- Lucide React
- pdfjs-dist
- Vercel serverless function for Gemini

Main Pages
----------

- /                -> Home page
- /explore         -> Explore community experiences
- /prep-material   -> Company prep + study materials
- /share           -> Protected page for sharing experiences
- /login           -> Login page
- /register        -> Registration page
- /update-password -> Password update flow
- /admin-dashboard -> Admin-only dashboard

Admin Access
------------

Admin access is granted when the signed-in user's email ends with:

adminprepconnect@gmail.com

Local Development
-----------------

1. Install dependencies
   npm install

2. Start the development server
   npm run dev

3. Build for production
   npm run build

4. Preview the production build locally
   npm run preview

5. Run lint checks
   npm run lint

Environment Variables
---------------------

Create a .env file in the project root with the following values:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Optional local frontend Gemini key:
VITE_GEMINI_API_KEY=your_gemini_key

Server-side Gemini key for the Vercel function:
GEMINI_API_KEY=your_gemini_key

Database Notes
--------------

This project uses Supabase tables including:

- experiences
- prep_materials
- study_materials

The SQL for the study_materials table is available here:

supabase/study_materials.sql

Important Behavior
------------------

- If the study_materials table does not exist, the UI still shows the study
  section layout, but admin-saved study content will not persist until the
  table is created.
- Prep material combines admin-added company data with question patterns
  detected from shared experiences.
- The chatbot currently uses simple built-in responses in the active UI.
  There is also Gemini integration code in the project for server-based usage.

Relevant Files
--------------

- src/App.jsx
- src/pages/Home.jsx
- src/pages/PrepMaterial.jsx
- src/pages/AdminDashboard.jsx
- src/components/StudyMaterialAdminPanel.jsx
- src/components/ChatBot.jsx
- src/supabaseClient.js
- api/gemini.js
- supabase/study_materials.sql

Deployment
----------

The project includes a vercel.json file and an API route at:

api/gemini.js

If deploying on Vercel, make sure the required environment variables are added
in the Vercel project settings.

Notes
-----

- node_modules and dist are already present in this workspace, but they should
  normally be generated locally rather than committed.
- The existing README.md is still the default Vite template. This readme.txt is
  a project-specific plain text overview for PrepConnect.
