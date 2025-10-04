import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('jobplexity_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('jobplexity_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      name,
    };

    users.push(newUser);
    localStorage.setItem('jobplexity_users', JSON.stringify(users));
    
    const userWithoutPassword = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(userWithoutPassword);
    localStorage.setItem('jobplexity_user', JSON.stringify(userWithoutPassword));
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('jobplexity_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const userWithoutPassword = { id: foundUser.id, email: foundUser.email, name: foundUser.name };
    setUser(userWithoutPassword);
    localStorage.setItem('jobplexity_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jobplexity_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
