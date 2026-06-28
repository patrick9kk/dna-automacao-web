import React, { createContext, useContext, useState } from 'react';
import type { UserClaims } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK MODE — funciona sem AWS. Troque para false após configurar o Cognito.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_USER: UserClaims = {
  sub:                  'mock-001',
  email:                'analista@dnafacilities.com.br',
  name:                 'Analista DNA',
  'custom:role':        'Analista',
  'custom:department':  'Manutenção',
  'custom:plant':       'SP-01',
  'cognito:groups':     ['Analista'],
};

interface AuthState {
  user:            UserClaims | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  plant:           string;
  department:      string;
  role:            string;
}

interface AuthContextValue extends AuthState {
  login:        (username: string, password: string) => Promise<void>;
  logout:       () => Promise<void>;
  loginWithSSO: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null, isLoading: false, isAuthenticated: false,
    plant: '', department: '', role: '',
  });

  const MOCK_CREDENTIALS = { username: 'Patrick', password: '1234' };

  const login = async (username: string, password: string) => {
    if (username !== MOCK_CREDENTIALS.username || password !== MOCK_CREDENTIALS.password) {
      throw new Error('Usuário ou senha inválidos.');
    }
    setState({
      user:            MOCK_USER,
      isLoading:       false,
      isAuthenticated: true,
      plant:           MOCK_USER['custom:plant'],
      department:      MOCK_USER['custom:department'],
      role:            MOCK_USER['custom:role'],
    });
  };

  const logout = async () => {
    setState({ user: null, isLoading: false, isAuthenticated: false, plant: '', department: '', role: '' });
  };

  const loginWithSSO = () => login('sso', 'sso');

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loginWithSSO }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
