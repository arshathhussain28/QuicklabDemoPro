import React, { createContext, useContext, useState } from 'react';

type Role = 'admin' | 'sales';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Mock credentials
const MOCK_USERS: (User & { password: string })[] = [
  { id: 'admin-1', name: 'Admin', email: 'admin@quicklab.com', role: 'admin', password: 'admin123' },
  { id: '1', name: 'Rahul Sharma', email: 'rahul@quicklab.com', role: 'sales', password: 'sales123' },
  { id: '2', name: 'Priya Patel', email: 'priya@quicklab.com', role: 'sales', password: 'sales123' },
  { id: '3', name: 'Amit Kumar', email: 'amit@quicklab.com', role: 'sales', password: 'sales123' },
  { id: '4', name: 'Arshath', email: 'arshath@quicklab.com', role: 'sales', password: 'arshath123' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log("Logging in to:", `${API_BASE_URL}/auth/login`);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed or API not reachable", e);
      // Fallback for Demo/Preview if API is down
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (mockUser) {
        console.warn("Using MOCK credentials because API is unreachable.");
        const { password, ...userWithoutPass } = mockUser;
        localStorage.setItem('token', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(userWithoutPass));
        setUser(userWithoutPass);
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
