import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { lastKnown } from '@/lib/offline/lastKnown';

const AuthContext = createContext();

function rememberUser(user) {
  if (user?.email) {
    lastKnown.set('auth-user', {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    });
  } else {
    lastKnown.remove('auth-user');
  }
}

export const AuthProvider = ({ children }) => {
  const cachedUser = lastKnown.get('auth-user') || null;
  const [user, setUser] = useState(cachedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!cachedUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const apply = (session) => {
      const next = session?.user ?? null;
      setUser(next);
      setIsAuthenticated(!!next);
      rememberUser(next);
    };

    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('auth-timeout')), 4000);
    });

    Promise.race([supabase.auth.getSession(), timeout])
      .then(({ data: { session } }) => {
        if (session?.user) apply(session);
        else if (!cachedUser) apply(null);
        setIsLoadingAuth(false);
      })
      .catch(() => {
        // Keep the last signed-in user so admin screens can still read cache.
        setIsLoadingAuth(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        apply(session);
      } else if (navigator.onLine) {
        apply(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    rememberUser(null);
    setUser(null);
    setIsAuthenticated(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      logout,
      navigateToLogin: () => { window.location.href = '/login'; }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
