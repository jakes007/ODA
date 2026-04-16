import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const mockUsers = [
  {
    id: 'user_player_jason',
    email: 'player@oda.com',
    password: '123456',
    role: 'player',
    playerId: 'player_jason',
    displayName: 'Jason Isaacs'
  },
  {
    id: 'user_admin_jake',
    email: 'admin@oda.com',
    password: '123456',
    role: 'admin',
    playerId: null,
    displayName: 'Admin Jake'
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  function login(email, password) {
    const matchedUser = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    setCurrentUser(matchedUser);

    return {
      success: true,
      user: matchedUser
    };
  }

  function logout() {
    setCurrentUser(null);
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}