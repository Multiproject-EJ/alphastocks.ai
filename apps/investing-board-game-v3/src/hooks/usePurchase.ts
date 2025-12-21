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
      // Simulate quick purchase (no artificial delays!)
      // In production, this would call your API
      await new Promise(resolve => setTimeout(resolve, 200));

      // SUCCESS - no daily limits, no waiting!
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
