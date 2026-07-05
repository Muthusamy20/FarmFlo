import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ReportsPage from './pages/Reports';
import AIInsightsPage from './pages/AIInsights';
import NotificationsPage from './pages/Notifications';
import UsersPage from './pages/Users';
import ActivityLogsPage from './pages/ActivityLogs';
import ProfilePage, { SettingsPage } from './pages/Profile';
import {
  FarmsPage, CowsPage, GoatsPage, PoultryPage, FeedPage,
  MilkPage, EggsPage, HealthPage, VaccinationsPage, BreedingPage,
  SalesPage, CustomersPage, ExpensesPage, IncomePage,
} from './pages/modules';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/auth" element={<GuestRoute><AuthLayout /></GuestRoute>}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>

            <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="farms" element={<FarmsPage />} />
              <Route path="cows" element={<CowsPage />} />
              <Route path="goats" element={<GoatsPage />} />
              <Route path="poultry" element={<PoultryPage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="milk" element={<MilkPage />} />
              <Route path="eggs" element={<EggsPage />} />
              <Route path="health" element={<HealthPage />} />
              <Route path="vaccinations" element={<VaccinationsPage />} />
              <Route path="breeding" element={<BreedingPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="income" element={<IncomePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="ai-insights" element={<AIInsightsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="activity-logs" element={<AdminRoute><ActivityLogsPage /></AdminRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
