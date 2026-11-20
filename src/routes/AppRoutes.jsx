import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import FestivalPage from '../pages/public/FestivalPage';
import EventDetailsPage from '../pages/public/EventDetailsPage';
import PublicRegistrationPage from '../pages/public/PublicRegistrationPage';
import SchedulePage from '../pages/public/SchedulePage';
import LoginPage from '../pages/auth/LoginPage';
import CoordinatorSignupPage from '../pages/auth/CoordinatorSignupPage';

// Super Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminFestivalEvents from '../pages/admin/AdminFestivalEvents';
import AdminEventFolderView from '../pages/admin/AdminEventFolderView';
import AdminFacultyList from '../pages/admin/AdminFacultyList';
import AdminStudentCoordinators from '../pages/admin/AdminStudentCoordinators';
import AdminAssignments from '../pages/admin/AdminAssignments';
import AdminParticipants from '../pages/admin/AdminParticipants';
import AdminReports from '../pages/admin/AdminReports';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyMyEvents from '../pages/faculty/FacultyMyEvents';
import FacultyCoordinators from '../pages/faculty/FacultyCoordinators';
import FacultyParticipants from '../pages/faculty/FacultyParticipants';
import FacultyFormBuilder from '../pages/faculty/FacultyFormBuilder';
import FacultyAnnouncements from '../pages/faculty/FacultyAnnouncements';
import FacultyProfile from '../pages/faculty/FacultyProfile';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAssignedEvents from '../pages/student/StudentAssignedEvents';
import StudentParticipants from '../pages/student/StudentParticipants';
import StudentProfile from '../pages/student/StudentProfile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/esperanza" element={<FestivalPage defaultSlug="esperanza" />} />
        <Route path="/aashayein" element={<FestivalPage defaultSlug="aashayein" />} />
        <Route path="/festival/:slug" element={<FestivalPage />} />
        <Route path="/events/:festivalSlug/:eventSlug" element={<EventDetailsPage />} />
        <Route path="/register/:festivalSlug/:eventSlug" element={<PublicRegistrationPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/coordinator-signup" element={<CoordinatorSignupPage />} />
      </Route>

      {/* Super Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="festival/:slug" element={<AdminFestivalEvents />} />
        <Route path="festival/:slug/event/:eventId" element={<AdminEventFolderView />} />
        <Route path="events" element={<AdminFestivalEvents />} />
        <Route path="events/:eventId" element={<AdminEventFolderView />} />
        <Route path="faculty" element={<AdminFacultyList />} />
        <Route path="students" element={<AdminStudentCoordinators />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="participants" element={<AdminParticipants />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAuditLogs />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty_coordinator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="events" element={<FacultyMyEvents />} />
        <Route path="students" element={<FacultyCoordinators defaultRoleFilter="student_coordinator" />} />
        <Route path="co-coordinators" element={<FacultyCoordinators defaultRoleFilter="co_coordinator" />} />
        <Route path="participants" element={<FacultyParticipants />} />
        <Route path="forms" element={<FacultyFormBuilder />} />
        <Route path="announcements" element={<FacultyAnnouncements />} />
        <Route path="profile" element={<FacultyProfile />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student_coordinator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="events" element={<StudentAssignedEvents />} />
        <Route path="participants" element={<StudentParticipants />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
