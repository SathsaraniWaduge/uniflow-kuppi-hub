import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentNotices from "./pages/StudentNotices";
import StudentRecordings from "./pages/StudentRecordings";
import StudentFeedback from "./pages/StudentFeedback";
import StudentSessions from "./pages/StudentSessions";
import CreateNotice from "./pages/CreateNotice";
import ManageNotices from "./pages/ManageNotices";
import ManageSessions from "./pages/ManageSessions";
import ManageRecordings from "./pages/ManageRecordings";
import ManageModules from "./pages/ManageModules";
import ManageStudents from "./pages/ManageStudents";
import MeetingRoom from "./pages/MeetingRoom";
import CreateRecording from "./pages/CreateRecording";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {/* Student routes */}
            <Route path="/notices" element={<ProtectedRoute role="student"><StudentNotices /></ProtectedRoute>} />
            <Route path="/recordings" element={<ProtectedRoute role="student"><StudentRecordings /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute role="student"><StudentSessions /></ProtectedRoute>} />
            <Route path="/my-feedback" element={<ProtectedRoute role="student"><StudentFeedback /></ProtectedRoute>} />
            {/* Organizer routes */}
            <Route path="/create-notice" element={<ProtectedRoute role="organizer"><CreateNotice /></ProtectedRoute>} />
            <Route path="/manage-notices" element={<ProtectedRoute role="organizer"><ManageNotices /></ProtectedRoute>} />
            <Route path="/manage-sessions" element={<ProtectedRoute role="organizer"><ManageSessions /></ProtectedRoute>} />
            <Route path="/manage-recordings" element={<ProtectedRoute role="organizer"><ManageRecordings /></ProtectedRoute>} />
            <Route path="/manage-modules" element={<ProtectedRoute role="organizer"><ManageModules /></ProtectedRoute>} />
            <Route path="/manage-students" element={<ProtectedRoute role="organizer"><ManageStudents /></ProtectedRoute>} />
            <Route path="/meeting" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
