import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/admin/RequireAuth';
import MapPage from './pages/MapPage';

// El panel administrativo se carga aparte para no pesar en el mapa público.
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export default function App() {
  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center text-sm text-slate-500">Cargando…</div>}>
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
