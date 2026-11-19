# ESPERENZA & AASHAYEIN 2026–2027
## College Festival Management & Coordinator Portal

A centralized event management platform for managing technical and cultural college festivals, faculty coordinators, student coordinators, co-coordinators, event registrations, and student participants.

---

## 🌟 Overview & Key Highlights

- **Branding**: ESPERENZA & AASHAYEIN 2026–2027
- **Tagline**: *"Celebrating Innovation, Creativity and Talent."*
- **Primary Festivals**:
  - **Esperenza**: Premier annual inter-collegiate technical festival (Robo Race Championship, Young Scientist Exhibition, Hackathons, Circuits).
  - **Aashayein**: Vibrant annual cultural festival (Dance Championship, Anchoring & RJ Hunt, Symphony Singing, Natraj Street Play & Drama).
- **Architecture**:
  - Frontend: React.js (Vite, JavaScript ES6+, Tailwind CSS, Lucide Icons, React Router DOM v7)
  - Backend & Database: Supabase PostgreSQL with Row Level Security (RLS)
  - Data Sync: Supabase Realtime + Reactive fallback store
  - Reports: Multi-sheet formatted Excel (`xlsx`) & CSV (`file-saver`)

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase Project URL and Anon Public Key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Note: If Supabase credentials are not provided initially, the application operates in reactive hybrid mode with full mock state, allowing immediate evaluation of all workflows and dashboards.)*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Setup & Supabase Migrations

The database migration files are located under `supabase/migrations/`:

1. `20260101000000_init_festival_schema.sql`:
   - Normalized PostgreSQL tables: `profiles`, `festivals`, `events`, `coordinator_applications`, `event_assignments`, `registration_forms`, `form_fields`, `participants`, `participant_answers`, `audit_logs`, `announcements`.
   - Foreign keys with cascading deletions, performance indexes, and uniqueness constraints.
   - Database triggers: auto-creates `profiles` on Supabase Auth signup.
   - Row Level Security (RLS) policies and security helper functions:
     - `is_admin()`
     - `is_verified_faculty()`
     - `has_event_access(event_id)`
     - `is_assigned_faculty(event_id)`
   - Seed data for Esperenza & Aashayein festivals, initial events (Young Scientist, Robo Race, Dance, Anchoring, Singing, Drama), and published forms.

2. `20260101000001_admin_helper_functions.sql`:
   - `verify_faculty_coordinator(user_id, status)`: Administrator verification procedure.
   - `assign_event_coordinator(event_id, user_id, role, previous_id)`: Appoints coordinators while preserving replacement history.
   - `submit_participant_registration(...)`: Transactional registration and answer submission.

To execute the migrations:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Paste the contents of `20260101000000_init_festival_schema.sql` and run it.
4. Paste the contents of `20260101000001_admin_helper_functions.sql` and run it.

---

## 👥 User Roles & Test Credentials

The portal features a **Role Switcher / Test Account Selector** in the bottom-right corner for 1-click evaluation:

| Role | Test Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@festival.edu` | `password123` | Complete institutional control: create events, verify faculty, manage assignments, audit logs, download 8-sheet Master Excel. |
| **Verified Faculty** | `priya.nair@festival.edu` | `password123` | In-Charge of **Aashayein Dance**: Appoint student coordinators & co-coordinators, build dynamic participant registration forms, export event reports. |
| **Pending Faculty** | `neha.gupta@festival.edu` | `password123` | Unverified faculty account: Can log in, but form-building and assignment actions are gated until approved by an administrator. |
| **Student Coordinator** | `rohit.mehta@student.edu` | `password123` | Student Lead for **Aashayein Dance**: View assigned event details, faculty contact, fellow co-coordinators, and participant roster. |

---

## 📊 Modules & Functional Capabilities

### 1. Public Festival Portal
- Modern responsive navigation bar, hero banner, photography for technical (Robo Race, Young Scientist) and cultural (Dance, Music, Drama) competitions.
- Dynamic event cards loaded directly from Supabase (adding an event in Admin immediately reflects on the homepage without code edits).
- Event details page with venue, schedule, rules, and coordinator roster.

### 2. Coordinator Registration & Workflow
- Common registration portal for both Faculty and Student coordinators.
- Dynamic dropdowns: Selecting a festival dynamically loads available active events.
- Student accounts activate automatically upon registration.
- Faculty accounts are created in **Pending Verification** state; Super Admin verifies credentials in the admin console.
- Super Admin accounts cannot be created through public signup.

### 3. Super Admin Command Center
- Live analytics metrics: Total festivals, events, faculty coordinators, student coordinators, participants, pending verifications.
- Primary festival hubs: **Esperenza** and **Aashayein** command centers.
- Dynamic Event Creator: Add/edit/archive events with date, venue, category, cover image, and team sizing.
- Faculty verification portal: One-click approval / revocation with audit tracking.
- Coordinator assignment console: Appoint coordinators or replace someone while archiving historical assignments.
- Central participant database with filter by festival, event, and status.

### 4. Faculty Coordinator Hub
- Scoped to assigned competitions only.
- Coordinator Appointment Module: Appoint Main Student Coordinators, Co-Coordinators, and Volunteers.
- Replace Coordinator Workflow: Replaces a coordinator while preserving assignment history (marking previous as `replaced` and inserting the successor).
- Participant inspection & status updates (Registered, Confirmed, Attended, Cancelled).

### 5. Dynamic Registration Form Builder
- Faculty can customize registration questions for their events without code modifications:
  - Standard fields: Name, ERP Number, Email, Mobile, Department, Year, Section.
  - Custom fields: Single-line Text, Number, Email, Dropdown Select, Radio Buttons, Checkboxes, Date Picker, Multi-line Paragraph.
  - Reorder fields, required/optional toggle, add comma-separated options.
  - Live form preview mode.
  - Publish form, save as draft, close registration, or set deadline.
  - Generates unique public registration link (e.g., `/register/aashayein/dance`).
- Duplicate submission prevention: Rejects duplicate submissions with the same ERP number for that event.

### 6. Reports & Data Downloads
- **Consolidated Master Excel Workbook** (`.xlsx` with 8 formatted sheets):
  1. `Festival Summary`
  2. `Event List`
  3. `Faculty Coordinators`
  4. `Student Coordinators`
  5. `Co-Coordinators`
  6. `Esperenza Participants`
  7. `Aashayein Participants`
  8. `Event-wise Summary`
- **Dedicated Event Downloads**:
  - `<Event>_Student_Coordinators.xlsx`
  - `<Event>_Faculty_Coordinators.xlsx`
  - `<Event>_Participants.xlsx`
  - `<Event>_Complete_Report.xlsx`
- Raw CSV exports for all lists.

### 7. Realtime Data Synchronization & Audit Logging
- Supabase Realtime channel subscriptions on `events`, `event_assignments`, `participants`, `registration_forms`, and `announcements`.
- Immutable audit log records actor, table name, record ID, and operational details for every administrative change.
