import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { T } from './theme';

import Sidebar      from './components/Layout/Sidebar';
import Login        from './components/Login/Login';
import PainelInicial from './components/PainelInicial/PainelInicial';
import Energia      from './components/Energia/Energia';
import Agua         from './components/Agua/Agua';
import Nivel        from './components/Nivel/Nivel';
import StatusMedidores from './components/StatusMedidores/StatusMedidores';
import Icon         from './components/Layout/Icon';

const EmBreve: React.FC<{ titulo: string; icon?: string }> = ({ titulo, icon = 'construction' }) => (
  <div style={{ background: T.bgBase, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
    <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={34} color="#fff" />
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: T.txtPrimary }}>{titulo}</div>
    <div style={{ fontSize: 14, color: T.txtMuted }}>Em desenvolvimento — disponível em breve</div>
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: T.bgBase }}>
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"        element={<PrivateRoute><AppLayout><PainelInicial /></AppLayout></PrivateRoute>} />
      <Route path="/energia"          element={<PrivateRoute><AppLayout><Energia /></AppLayout></PrivateRoute>} />
      <Route path="/agua"             element={<PrivateRoute><AppLayout><Agua /></AppLayout></PrivateRoute>} />
      <Route path="/nivel"            element={<PrivateRoute><AppLayout><Nivel /></AppLayout></PrivateRoute>} />
      <Route path="/status-medidores" element={<PrivateRoute><AppLayout><StatusMedidores /></AppLayout></PrivateRoute>} />
      <Route path="/alarmes"          element={<PrivateRoute><AppLayout><EmBreve titulo="Alarmes" icon="notifications_active" /></AppLayout></PrivateRoute>} />
      <Route path="/manutencao/*"     element={<PrivateRoute><AppLayout><EmBreve titulo="Manutenção" icon="build" /></AppLayout></PrivateRoute>} />
      <Route path="*"                 element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
