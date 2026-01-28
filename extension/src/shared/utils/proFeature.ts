import { apiService } from '../services/api';

let isProCache: boolean | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const checkProStatus = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Return cached value if still valid
  if (isProCache !== null && now - cacheTimestamp < CACHE_DURATION) {
    return isProCache;
  }

  try {
    const response = await apiService.get<{ success: boolean; data: { status: string } }>('/subscriptions/me');
    
    if (response.success && response.data) {
      const isPro = response.data.status === 'active';
      isProCache = isPro;
      cacheTimestamp = now;
      return isPro;
    }
    
    isProCache = false;
    cacheTimestamp = now;
    return false;
  } catch (error) {
    console.error('Failed to check Pro status:', error);
    // On error, assume not Pro
    isProCache = false;
    cacheTimestamp = now;
    return false;
  }
};

export const clearProCache = (): void => {
  isProCache = null;
  cacheTimestamp = 0;
};

export const showUpgradePrompt = (): void => {
  // This would typically open a modal or redirect to upgrade page
  alert('This feature requires a Pro subscription. Please upgrade to access Pro features.');
  // In a real implementation, this would navigate to the upgrade page
};

