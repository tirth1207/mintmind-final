import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { UserProfile, BudgetBreakdown, AppSettings } from '@/types';
import { calculate503020Budget } from '@/lib/finance/budget';
import { calculateRecommendedSIP } from '@/lib/finance/sip';

const DEFAULT_USER_PROFILE: UserProfile = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  travelCost: 0,
  foodSnacks: 0,
  randomExpenses: 0,
  sipGoal: 0,
  riskLevel: 'medium',
  hasCompletedOnboarding: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  currency: '₹',
};

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [profileData, settingsData] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('settings'),
      ]);

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async function updateSettings(updates: Partial<AppSettings>) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async function resetData() {
    setUserProfile(DEFAULT_USER_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.multiRemove(['userProfile', 'settings']);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }

  const budget = useMemo<BudgetBreakdown | null>(() => {
    if (userProfile.monthlyIncome === 0) return null;
    return calculate503020Budget(userProfile.monthlyIncome);
  }, [userProfile.monthlyIncome]);

  const recommendedSIP = useMemo<number>(() => {
    if (userProfile.monthlyIncome === 0 || userProfile.monthlyExpenses === 0) {
      return 0;
    }
    return calculateRecommendedSIP(
      userProfile.monthlyIncome,
      userProfile.monthlyExpenses,
      userProfile.riskLevel
    );
  }, [userProfile.monthlyIncome, userProfile.monthlyExpenses, userProfile.riskLevel]);

  const monthlySurplus = useMemo<number>(() => {
    return userProfile.monthlyIncome - userProfile.monthlyExpenses;
  }, [userProfile.monthlyIncome, userProfile.monthlyExpenses]);

  const plannedSavings = useMemo<number>(() => {
    // Savings = Income - Expenses
    return Math.max(0, userProfile.monthlyIncome - userProfile.monthlyExpenses);
  }, [userProfile.monthlyIncome, userProfile.monthlyExpenses]);

  return {
    userProfile,
    settings,
    isLoading,
    budget,
    recommendedSIP,
    monthlySurplus,
    plannedSavings,
    updateUserProfile,
    updateSettings,
    resetData,
  };
});

export function useTheme() {
  const { settings } = useAppState();
  return settings.theme;
}
