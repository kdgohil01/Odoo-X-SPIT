import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import { WelcomeScreen } from '../onboarding/WelcomeScreen';
import { DataService } from '../../lib/dataService';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user, isAuthenticated } = useAuth();
  const { products, warehouses } = useInventory();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check if user needs onboarding
      const hasData = DataService.hasUserData(user.id);
      const hasMinimalData = products.length > 0 || warehouses.length > 0;
      
      // Show welcome screen if:
      // 1. User has no data at all, OR
      // 2. User has initialized data but no actual products/warehouses
      const needsOnboarding = !hasData || (!hasMinimalData && hasData);
      
      setShowWelcome(needsOnboarding);
      setIsCheckingOnboarding(false);
    } else {
      setIsCheckingOnboarding(false);
      setShowWelcome(false);
    }
  }, [isAuthenticated, user?.id, products.length, warehouses.length]);

  const handleCompleteOnboarding = () => {
    setShowWelcome(false);
  };

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (isAuthenticated && showWelcome) {
    return <WelcomeScreen onComplete={handleCompleteOnboarding} />;
  }

  // Show normal app
  return <>{children}</>;
}