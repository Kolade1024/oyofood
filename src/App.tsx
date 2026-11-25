import { lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Toasts } from './components/ui'
import PortalLayout from './components/PortalLayout'
import Welcome from './pages/auth/Welcome'
import Login from './pages/auth/Login'
import { CheckEmail, ForgotPassword, ResetPassword, ResetSuccess } from './pages/auth/Recovery'
import Signup from './pages/onboarding/Signup'

// Portal screens are split per route: Recharts and each page only load when visited.
const Dashboard = lazy(() => import('./pages/portal/Dashboard'))
const Orders = lazy(() => import('./pages/portal/Orders'))
const Menu = lazy(() => import('./pages/portal/Menu'))
const Earnings = lazy(() => import('./pages/portal/Earnings'))
const Analytics = lazy(() => import('./pages/portal/Analytics'))
const Reviews = lazy(() => import('./pages/portal/Reviews'))
const Promotions = lazy(() => import('./pages/portal/Promotions'))
const OperatingHours = lazy(() => import('./pages/portal/OperatingHours'))
const Settings = lazy(() => import('./pages/portal/Settings'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/signup" element={<Navigate to="/signup/1" replace />} />
        <Route path="/signup/:step" element={<Signup />} />

        <Route element={<PortalLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/hours" element={<OperatingHours />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </AppProvider>
  )
}
