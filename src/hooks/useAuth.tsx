import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import supabase from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileService } from '@/lib/supabase/services/ProfileService';
import { UserProfile } from '@/context/UserContext';

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  isLoading: boolean;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => void;
}

const defaultUserProfile: UserProfile = {
  name: '',
  age: 30,
  gender: 'male',
  height: 175,
  weight: 75,
  fitnessGoal: 'muscle_gain',
  workoutFrequency: 3,
  diet: 'standard',
  equipment: 'full_gym',
  hasCompletedAssessment: false,
  allergies: []
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthed = !!session;
        setIsAuthenticated(isAuthed);
        setUserId(session?.user.id || null);
        setIsLoading(false);
        
        // Sync user profile when authenticated
        if (isAuthed && session?.user.id) {
          fetchUserProfile(session.user.id);
        } else if (!isAuthed) {
          // Clear user data when not authenticated
          setUserProfile(null);
        }
      }
    );

    // Check initial session
    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserId(session?.user.id || null);
      
      if (session?.user.id) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth user:', error);
      setIsLoading(false);
    }
  }
  
  async function fetchUserProfile(userId: string) {
    try {
      const profileData = await ProfileService.getProfile(userId);
      
      if (profileData) {
        const userProfile = ProfileService.mapProfileToUserContext(profileData);
        setUserProfile(userProfile);
      } else {
        // If no profile exists yet, set default values
        setUserProfile(defaultUserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Profile Error",
        description: "Could not load your profile data",
        variant: "destructive"
      });
    }
  }

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function signUp(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email for verification."
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function resetPassword(email: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for password reset instructions."
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error requesting password reset:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function updatePassword(password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error updating password:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      updatePassword,
      isLoading,
      userProfile,
      updateUserProfile
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
