import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../api/auth'

const AdminRoute = ({ children }) => {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

export default AdminRoute
