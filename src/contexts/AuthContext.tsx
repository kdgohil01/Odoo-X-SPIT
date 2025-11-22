import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DataService } from '../lib/dataService';

interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  updateAvatar: (avatar: string) => void;
  deleteAvatar: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper functions for local storage management
  const getRegisteredUsers = (): RegisteredUser[] => {
    const users = localStorage.getItem('stock_master_users');
    return users ? JSON.parse(users) : [];
  };

  const saveRegisteredUsers = (users: RegisteredUser[]) => {
    localStorage.setItem('stock_master_users', JSON.stringify(users));
  };

  const getCurrentSession = (): User | null => {
    const session = localStorage.getItem('stock_master_session');
    return session ? JSON.parse(session) : null;
  };

  const saveCurrentSession = (user: User) => {
    localStorage.setItem('stock_master_session', JSON.stringify(user));
  };

  const clearCurrentSession = () => {
    localStorage.removeItem('stock_master_session');
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const findUserByEmail = (email: string): RegisteredUser | null => {
    const users = getRegisteredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  };

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedSession = getCurrentSession();
    if (savedSession) {
      setUser(savedSession);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Validate input
    const emailError = validateEmail(email);
    if (emailError) {
      throw new Error(emailError);
    }

    if (!password) {
      throw new Error('Password is required');
    }

    // Find user in local storage
    const registeredUser = findUserByEmail(email);
    if (!registeredUser) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    // Verify password
    if (registeredUser.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Create user session
    const loggedInUser: User = {
      id: registeredUser.id,
      email: registeredUser.email,
      name: registeredUser.name,
      avatar: registeredUser.avatar,
    };

    setUser(loggedInUser);
    setIsAuthenticated(true);
    saveCurrentSession(loggedInUser);
  };

  const loginWithGoogle = async () => {
    // For demo purposes, create a Google user
    // In a real app, this would integrate with Google OAuth
    const googleUser: User = {
      id: `google-${Date.now()}`,
      email: 'demo@google.com',
      name: 'Google User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };

    setUser(googleUser);
    setIsAuthenticated(true);
    saveCurrentSession(googleUser);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Validate input
    const emailError = validateEmail(email);
    if (emailError) {
      throw new Error(emailError);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered. Please login instead.');
    }

    // Create new user
    const newRegisteredUser: RegisteredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password: password,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to registered users
    const users = getRegisteredUsers();
    users.push(newRegisteredUser);
    saveRegisteredUsers(users);

    // Create user session
    const newUser: User = {
      id: newRegisteredUser.id,
      email: newRegisteredUser.email,
      name: newRegisteredUser.name,
      avatar: newRegisteredUser.avatar,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    saveCurrentSession(newUser);
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Validate input
    const emailError = validateEmail(email);
    if (emailError) {
      throw new Error(emailError);
    }

    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = findUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Email already taken by another user');
      }
    }

    // Update in registered users
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], name: name.trim(), email: email.toLowerCase() };
      saveRegisteredUsers(users);
    }

    // Update current session
    const updatedUser = { ...user, name: name.trim(), email: email.toLowerCase() };
    setUser(updatedUser);
    saveCurrentSession(updatedUser);
  };

  const updateAvatar = (avatar: string) => {
    if (!user) return;

    // Update in registered users
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], avatar };
      saveRegisteredUsers(users);
    }

    // Update current session
    const updatedUser = { ...user, avatar };
    setUser(updatedUser);
    saveCurrentSession(updatedUser);
  };

  const deleteAvatar = () => {
    if (!user) return;

    // Update in registered users
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      const updatedRegisteredUser = { ...users[userIndex] };
      delete updatedRegisteredUser.avatar;
      users[userIndex] = updatedRegisteredUser;
      saveRegisteredUsers(users);
    }

    // Update current session
    const updatedUser = { ...user };
    delete updatedUser.avatar;
    setUser(updatedUser);
    saveCurrentSession(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // Find user in registered users
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Verify current password
    if (users[userIndex].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    users[userIndex] = { ...users[userIndex], password: newPassword };
    saveRegisteredUsers(users);
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Clear user-specific data
    DataService.clearUserData(user.id);

    // Remove from registered users
    const users = getRegisteredUsers();
    const filteredUsers = users.filter(u => u.id !== user.id);
    saveRegisteredUsers(filteredUsers);

    // Clear current session
    clearCurrentSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    clearCurrentSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      loginWithGoogle,
      logout, 
      updateProfile, 
      updateAvatar, 
      deleteAvatar,
      changePassword, 
      deleteAccount, 
      isAuthenticated 
    }}>
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
