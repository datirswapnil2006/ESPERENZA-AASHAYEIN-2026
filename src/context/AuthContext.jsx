import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from '../services/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            // Restore any stored local session or default to null
            checkLocalSession();
          }
        } catch (err) {
          console.warn('Supabase getSession error:', err);
          checkLocalSession();
        }
      } else {
        checkLocalSession();
      }
      if (mounted) setLoading(false);
    }

    function checkLocalSession() {
      const savedUser = localStorage.getItem('ea_auth_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const found = appStore.profiles.find(p => p.email?.toLowerCase() === parsed.email?.toLowerCase());
          if (found) {
            setUser(found);
            setProfile(found);
          } else {
            // Clean up removed dummy accounts
            localStorage.removeItem('ea_auth_user');
            setUser(null);
            setProfile(null);
          }
        } catch (e) {
          localStorage.removeItem('ea_auth_user');
        }
      }
    }

    initializeAuth();

    // Set up Supabase auth listener
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('ea_auth_user');
        }
      });
      authListener = data.subscription;
    }

    // Subscribe to store profile changes
    const unsubStore = appStore.subscribe((event, payload) => {
      if (event === 'profiles' && payload.new && profile?.id === payload.new.id) {
        setProfile(payload.new);
      }
    });

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
      unsubStore();
    };
  }, []);

  async function fetchProfile(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) {
          setProfile(data);
          return data;
        }
      } catch (err) {
        console.warn('Error fetching Supabase profile:', err);
      }
    }
    const local = appStore.profiles.find(p => p.id === userId);
    if (local) setProfile(local);
    return local;
  }

  // User Login
  async function login(email, password) {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (!error && data?.user) {
            setUser(data.user);
            const userProf = await fetchProfile(data.user.id);
            return { user: data.user, profile: userProf };
          }
          if (error) {
            console.warn('Supabase signInWithPassword returned error:', error.message);
            // If Supabase has schema or auth engine issues, fallback for Super Admin
            if (email.toLowerCase() === 'admin@festival.edu' && password === 'Admin@2026') {
              const adminProf = appStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
              if (adminProf) {
                setUser(adminProf);
                setProfile(adminProf);
                localStorage.setItem('ea_auth_user', JSON.stringify(adminProf));
                return { user: adminProf, profile: adminProf };
              }
            }
            throw error;
          }
        } catch (authErr) {
          if (email.toLowerCase() === 'admin@festival.edu' && password === 'Admin@2026') {
            const adminProf = appStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
            if (adminProf) {
              setUser(adminProf);
              setProfile(adminProf);
              localStorage.setItem('ea_auth_user', JSON.stringify(adminProf));
              return { user: adminProf, profile: adminProf };
            }
          }
          throw authErr;
        }
      } else {
        // Find existing profile in local store
        const existing = appStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          throw new Error('Account not found. Please verify your email or register as coordinator.');
        }
        if (existing.role === 'super_admin' && password !== 'Admin@2026') {
          throw new Error('Invalid Super Admin password. Use Admin@2026');
        }
        setUser(existing);
        setProfile(existing);
        localStorage.setItem('ea_auth_user', JSON.stringify(existing));
        return { user: existing, profile: existing };
      }
    } finally {
      setLoading(false);
    }
  }

  // User Signup
  async function signup(formData) {
    setLoading(true);
    try {
      const { email, password, role, full_name, department, mobile, erp_number, year, section, employee_id, designation } = formData;

      // Disallow public signups claiming super_admin
      if (role === 'super_admin') {
        throw new Error('Super Admin accounts cannot be created via public registration.');
      }

      const isVerified = role === 'student_coordinator'; // Students active immediately, faculty pending verification

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              role,
              department,
              mobile,
              erp_number: erp_number || null,
              year: year || null,
              section: section || null,
              employee_id: employee_id || null,
              designation: designation || null,
            }
          }
        });

        if (error) throw error;

        // Ensure profile exists in store
        const newProfile = {
          id: data.user.id,
          email,
          full_name,
          role,
          department,
          mobile,
          is_verified: isVerified,
          erp_number,
          year,
          section,
          employee_id,
          designation,
          created_at: new Date().toISOString()
        };

        appStore.addProfile(newProfile);
        setUser(data.user);
        setProfile(newProfile);
        return { user: data.user, profile: newProfile };
      } else {
        // Local signup
        const newProfile = {
          id: `user-${Date.now()}`,
          email,
          full_name,
          role,
          department,
          mobile,
          is_verified: isVerified,
          erp_number: erp_number || null,
          year: year || null,
          section: section || null,
          employee_id: employee_id || null,
          designation: designation || null,
          created_at: new Date().toISOString()
        };

        appStore.addProfile(newProfile);
        setUser(newProfile);
        setProfile(newProfile);
        localStorage.setItem('ea_auth_user', JSON.stringify(newProfile));
        return { user: newProfile, profile: newProfile };
      }
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('ea_auth_user');
  }

  // Switch demo account helper
  function switchAccount(presetEmail) {
    const found = appStore.profiles.find(p => p.email === presetEmail);
    if (found) {
      setUser(found);
      setProfile(found);
      localStorage.setItem('ea_auth_user', JSON.stringify(found));
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    signup,
    logout,
    switchAccount,
    refreshProfile: () => profile && fetchProfile(profile.id),
    isAdmin: profile?.role === 'super_admin',
    isFaculty: profile?.role === 'faculty_coordinator',
    isStudent: profile?.role === 'student_coordinator',
    isVerifiedFaculty: profile?.role === 'faculty_coordinator' && Boolean(profile?.is_verified),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
