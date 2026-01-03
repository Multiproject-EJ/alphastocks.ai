/**
 * Mobile Gesture Utilities
 * Provides swipe-to-close, pull-to-refresh, and haptic feedback support
 */

/**
 * Haptic feedback - vibrates device if supported
 * @param {string} type - Type of haptic feedback ('light', 'medium', 'heavy', 'selection')
 */
export function triggerHaptic(type = 'light') {
  if (!navigator.vibrate) return;
  
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
    selection: 5,
    success: [10, 50, 10],
    error: [20, 100, 20]
  };
  
  const pattern = patterns[type] || patterns.light;
  navigator.vibrate(pattern);
}

/**
 * Detect swipe gestures for closing modals
 * @param {HTMLElement} element - Element to attach gesture listener
 * @param {Function} onSwipeDown - Callback when user swipes down to close
 * @param {number} threshold - Minimum distance in pixels to trigger swipe (default: 100)
 * @returns {Function} Cleanup function to remove listeners
 */
export function setupSwipeToClose(element, onSwipeDown, threshold = 100) {
  let startY = 0;
  let startX = 0;
  let currentY = 0;
  let isDragging = false;
  
  const handleTouchStart = (e) => {
    // Guard against empty touches array
    if (!e.touches || e.touches.length === 0) return;
    
    // Only start drag from the header area or if scrolled to top
    const scrollContainer = element.querySelector('.report-scroll-content');
    const isAtTop = !scrollContainer || scrollContainer.scrollTop <= 0;
    
    if (!isAtTop) return;
    
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    isDragging = true;
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    // Guard against empty touches array
    if (!e.touches || e.touches.length === 0) return;
    
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const deltaX = Math.abs(e.touches[0].clientX - startX);
    
    // Only handle vertical swipes (not horizontal)
    if (deltaX > 30) {
      isDragging = false;
      return;
    }
    
    // Only allow swiping down
    if (deltaY > 0) {
      // Add visual feedback - translate the modal
      element.style.transform = `translateY(${Math.min(deltaY, 300)}px)`;
      element.style.transition = 'none';
      
      // Reduce opacity as user swipes
      const opacity = Math.max(0.3, 1 - (deltaY / 400));
      element.style.opacity = opacity;
      
      // Haptic feedback at threshold
      if (deltaY > threshold && deltaY < threshold + 10) {
        triggerHaptic('medium');
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    
    if (deltaY > threshold) {
      // Swipe successful - trigger close
      triggerHaptic('success');
      onSwipeDown();
    } else {
      // Reset position with animation
      element.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    }
    
    isDragging = false;
    startY = 0;
    currentY = 0;
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Setup pull-to-refresh gesture
 * @param {HTMLElement} scrollContainer - Scrollable container element
 * @param {Function} onRefresh - Callback when refresh is triggered
 * @param {number} threshold - Minimum pull distance to trigger refresh (default: 80)
 * @returns {Function} Cleanup function
 */
export function setupPullToRefresh(scrollContainer, onRefresh, threshold = 80) {
  let startY = 0;
  let isPulling = false;
  let refreshIndicator = null;
  
  const createRefreshIndicator = () => {
    if (refreshIndicator) return refreshIndicator;
    
    refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'refresh-indicator';
    refreshIndicator.innerHTML = '↓ Pull to refresh';
    refreshIndicator.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      right: 0;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    `;
    scrollContainer.style.position = 'relative';
    scrollContainer.insertBefore(refreshIndicator, scrollContainer.firstChild);
    return refreshIndicator;
  };
  
  const handleTouchStart = (e) => {
    // Guard against empty touches array
    if (!e.touches || e.touches.length === 0) return;
    
    if (scrollContainer.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  };
  
  const handleTouchMove = (e) => {
    if (!isPulling || scrollContainer.scrollTop > 0) {
      isPulling = false;
      return;
    }
    
    // Guard against empty touches array
    if (!e.touches || e.touches.length === 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 0) {
      const indicator = createRefreshIndicator();
      const progress = Math.min(deltaY / threshold, 1);
      indicator.style.opacity = progress;
      
      if (progress >= 1) {
        indicator.innerHTML = '↑ Release to refresh';
        triggerHaptic('selection');
      } else {
        indicator.innerHTML = '↓ Pull to refresh';
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (!isPulling) return;
    
    const indicator = refreshIndicator;
    if (indicator && indicator.style.opacity >= 0.9) {
      indicator.innerHTML = '⟳ Refreshing...';
      triggerHaptic('medium');
      onRefresh();
      
      setTimeout(() => {
        if (indicator) {
          indicator.style.opacity = '0';
        }
      }, 1000);
    } else if (indicator) {
      indicator.style.opacity = '0';
    }
    
    isPulling = false;
  };
  
  scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
  scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  return () => {
    scrollContainer.removeEventListener('touchstart', handleTouchStart);
    scrollContainer.removeEventListener('touchmove', handleTouchMove);
    scrollContainer.removeEventListener('touchend', handleTouchEnd);
    if (refreshIndicator && refreshIndicator.parentNode) {
      refreshIndicator.parentNode.removeChild(refreshIndicator);
    }
  };
}

/**
 * Lock body scroll (prevent background scrolling when modal is open)
 * @param {boolean} lock - Whether to lock or unlock
 */
export function lockBodyScroll(lock) {
  if (lock) {
    // Save current scroll position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  } else {
    // Restore scroll position
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
}

/**
 * Setup Android back button handler
 * @param {Function} onBackButton - Callback when back button is pressed
 * @returns {Function} Cleanup function
 */
export function setupBackButtonHandler(onBackButton) {
  const handlePopState = () => {
    // Note: popstate events are not cancelable
    onBackButton();
  };
  
  // Push a state to history so back button can close modal
  window.history.pushState({ modal: true }, '');
  
  window.addEventListener('popstate', handlePopState);
  
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}
