
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Workouts from "./pages/Workouts";
import WorkoutResults from "./pages/WorkoutResults";
import Planner from "./pages/Planner";
import Progress from "./pages/Progress";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/AuthGuard";
import { FeedbackFAB } from "./components/FeedbackFAB";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <FeedbackFAB />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Assessment route - no completion check needed */}
              <Route path="/assessment" element={
                <AuthGuard>
                  <Assessment />
                </AuthGuard>
              } />
              
              {/* Protected routes that require assessment completion */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } />
              <Route path="/workouts" element={
                <AuthGuard>
                  <Workouts />
                </AuthGuard>
              } />
              <Route path="/workout-results/:workoutLogId" element={
                <AuthGuard>
                  <WorkoutResults />
                </AuthGuard>
              } />
              <Route path="/planner" element={
                <AuthGuard>
                  <Planner />
                </AuthGuard>
              } />
              <Route path="/progress" element={
                <AuthGuard>
                  <Progress />
                </AuthGuard>
              } />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
