import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Sidebar          from './components/Layout/Sidebar';
import Login            from './components/Login/Login';
import PainelInicial    from './components/PainelInicial/PainelInicial';
import Energia          from './components/Energia/Energia';
import Agua             from './components/Agua/Agua';
import Nivel            from './components/Nivel/Nivel';
import StatusMedidores  from './components/StatusMedidores/StatusMedidores';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

// ── Placeholder para páginas ainda não implementadas ─────────────────────────
const EmBreve: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
    <h2 style={{ margin: 0, color: '#374151' }}>{title}</h2>
    <p style={{ marginTop: 8, fontSize: 14 }}>Módulo em desenvolvimento</p>
  </div>
);

// ── Layout principal com sidebar ─────────────────────────────────────────────
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: '#f3f4f6' }}>
        {children}
      </main>
    </div>
  );
};

// ── Rota protegida ───────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280' }}>
      Carregando…
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <AppLayout>{children}</AppLayout>;
};

// ── Root ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><PainelInicial /></ProtectedRoute>
          } />
          <Route path="/energia" element={
            <ProtectedRoute><Energia /></ProtectedRoute>
          } />
          <Route path="/agua" element={
            <ProtectedRoute><Agua /></ProtectedRoute>
          } />
          <Route path="/nivel" element={
            <ProtectedRoute><Nivel /></ProtectedRoute>
          } />
          <Route path="/status-medidores" element={
            <ProtectedRoute><StatusMedidores /></ProtectedRoute>
          } />
          <Route path="/alarmes" element={
            <ProtectedRoute><EmBreve title="Alarmes" /></ProtectedRoute>
          } />
          <Route path="/manutencao/chamados" element={
            <ProtectedRoute><EmBreve title="Chamados de Manutenção" /></ProtectedRoute>
          } />
          <Route path="/manutencao/preventivas" element={
            <ProtectedRoute><EmBreve title="Manutenções Preventivas" /></ProtectedRoute>
          } />
          <Route path="/manutencao/sla" element={
            <ProtectedRoute><EmBreve title="SLA" /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
