import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for accessing auth state without the provider requirement (useful for testing)
export function useOptionalAuth(): AuthContextType | undefined {
  return useContext(AuthContext);
}