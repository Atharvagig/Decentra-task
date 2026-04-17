import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { blockchain } from '../lib/blockchain';

interface AuthContextType {
  address: string | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isConnecting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem('decentratask_address');
    const savedSession = localStorage.getItem('decentratask_session');
    
    if (savedAddress && savedSession) {
      setAddress(savedAddress);
      setIsLoggedIn(true);
      blockchain.setAccount(savedAddress);
    }
  }, []);

  const login = async () => {
    setIsConnecting(true);
    try {
      const addr = await blockchain.connectWallet();
      const signature = await blockchain.signLoginMessage();
      
      // In a real app, you'd verify the signature on a backend
      // and issue a JWT. Here we simulate the session.
      localStorage.setItem('decentratask_address', addr);
      localStorage.setItem('decentratask_session', signature);
      
      setAddress(addr);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Authentication failed", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('decentratask_address');
    localStorage.removeItem('decentratask_session');
    setAddress(null);
    setIsLoggedIn(false);
    blockchain.setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ address, isLoggedIn, login, logout, isConnecting }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
