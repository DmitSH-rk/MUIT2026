import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Это наш компонент-обертка (Wrapper/Decorator)
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, user } = useAuthStore();

  // 1. Проверка на авторизацию
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Проверка на специфическую роль (например, только для 'club')
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container" style={{ marginTop: '50px', color: 'var(--support)' }}>
        <h2>Доступ запрещен</h2>
        <p>Ваша роль ({role}) не позволяет просматривать эту страницу.</p>
      </div>
    );
  }

  return children;
}