import { useOverlayContext, OverlayManagerAPI } from '@/context/OverlayContext'

/**
 * Hook to access the overlay manager API
 * 
 * @example
 * const { show, close, closeCurrent } = useOverlayManager()
 * 
 * // Show a modal
 * show({
 *   id: 'stock',
 *   component: StockModal,
 *   props: { stock: currentStock },
 *   priority: 'normal'
 * })
 */
export function useOverlayManager(): OverlayManagerAPI {
  return useOverlayContext()
}
