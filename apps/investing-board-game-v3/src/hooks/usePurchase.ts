import { useState, useCallback } from 'react';
import { useHaptics } from './useHaptics';

export function usePurchase() {
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { success: hapticSuccess } = useHaptics();

  const purchase = useCallback(async (itemId: string, cost: number): Promise<boolean> => {
    setIsPurchasing(itemId);
    setError(null);

    try {
      // Brief delay (200ms) to show purchase animation and provide visual feedback
      await new Promise(resolve => setTimeout(resolve, 200));

      // Purchase successful - unlimited purchases allowed (only limited by player's cash)
      hapticSuccess();
      setIsPurchasing(null);
      return true;
    } catch (e) {
      setError('Purchase failed');
      setIsPurchasing(null);
      return false;
    }
  }, [hapticSuccess]);

  return {
    purchase,
    isPurchasing,
    error,
  };
}
