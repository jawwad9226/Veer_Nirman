'use client'
import ProtectedAdminRoute from "./ProtectedAdminRoute"
import AnalyticsDashboard from "./analytics-dashboard"

export default function AdminPage() {
  return (
    <ProtectedAdminRoute>
      <AnalyticsDashboard />
    </ProtectedAdminRoute>
  )
}
