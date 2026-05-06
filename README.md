# School ERP - Frontend

Next.js 14 + Bootstrap 5 frontend integrated with the backend API.

## Setup

```bash
npm install
cp .env.example .env   # Set NEXT_PUBLIC_API_URL
npm run dev
```

## Login Credentials (after backend seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | admin123 |
| Staff | singh@school.edu | staff123 |
| Student | adm2024-0001@school.edu | student123 |

## Modules

Admin: Dashboard, Admissions, Students, Fees, Timetable, Attendance, Accounts, Payroll, Marks, Events, Staff, Settings
Staff: Dashboard, Attendance, Marks, Timetable, Tasks
Student: Dashboard, Profile, Attendance, Timetable, Marks, Notices, Settings
