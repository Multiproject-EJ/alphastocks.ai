# Quick Start Guide - Touch Targets & Gesture Arbitration

## For Developers

### Testing Your Touch Targets

#### Method 1: Visual Testing with TapTestOverlay

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Press `Ctrl+Shift+T` (or click the 🔍 button in bottom-right)

4. You'll see:
   - 🟢 **Green borders** = Good! Element is ≥44×44px
   - 🔴 **Red borders** = Fix needed! Element is <44×44px
   - Stats panel showing compliance percentage

#### Method 2: Console Audit

1. Open browser DevTools (F12)

2. Run in console:
   ```javascript
   window.auditTouchTargets()
   ```

3. Review the detailed report showing all non-compliant elements

### Adding Touch Targets to Your Components

#### Basic Button
```jsx
import { Button } from '@/components/ui/button'

<Button className="touch-feedback">
  Click Me
</Button>
```
✅ Button component already has 44px minimum built-in!

#### Custom Interactive Element
```jsx
<div 
  className="touch-target touch-feedback cursor-pointer"
  onClick={handleClick}
>
  Custom Touch Area
</div>
```

#### With Ripple Effect
```jsx
<button className="touch-target touch-ripple bg-blue-500 text-white px-4 py-2">
  Ripple Button
</button>
```

#### Different Sizes
```jsx
{/* Small but compliant (40px) */}
<button className="min-touch-sm">Small</button>

{/* Standard (44px) - Default */}
<button className="min-touch">Standard</button>

{/* Large (48px) */}
<button className="min-touch-lg">Large</button>

{/* Extra Large (56px) */}
<button className="min-touch-xl">Extra Large</button>
```

### Using Gesture Arbitration

The gesture system is already integrated! It works automatically for:

#### 1. Pinch Gestures (Highest Priority)
Two-finger pinch to zoom on the board:
- Automatically detected
- Prevents accidental taps during zoom
- Works in classic camera mode

#### 2. Swipe Gestures
Fast swipes for navigation:
- Swipe up → Opens shop
- Swipe down → Closes modals
- Velocity-based detection

#### 3. Pan Gestures
Slower drags for board movement:
- Pan to move around the board
- Won't trigger swipe actions
- Smooth tracking

#### 4. Tap Gestures (Lowest Priority)
Single touches:
- Only triggers if no movement
- Won't fire during pan/swipe
- Precise targeting

### Common Issues and Solutions

#### Problem: Element Too Small
```jsx
// ❌ Too small
<button className="w-8 h-8">X</button>

// ✅ Fixed with min-touch
<button className="w-8 h-8 min-touch">X</button>
```

#### Problem: Elements Too Close Together
```jsx
// ❌ No spacing
<div className="flex gap-1">
  <button>A</button>
  <button>B</button>
</div>

// ✅ Adequate spacing
<div className="flex gap-2 touch-spacing">
  <button>A</button>
  <button>B</button>
</div>
```

#### Problem: Icon Buttons Too Small
```jsx
// ❌ Small icon button
<button className="p-1">
  <Icon size={16} />
</button>

// ✅ Proper touch target
<Button size="icon" className="min-touch">
  <Icon size={20} />
</Button>
```

### Testing Checklist

Before pushing your changes:

- [ ] Run `window.auditTouchTargets()` in console
- [ ] Check compliance is >90%
- [ ] Test on actual mobile device if possible
- [ ] Verify all interactive elements are easy to tap
- [ ] Ensure adequate spacing between touch targets
- [ ] Test gesture interactions (pinch, swipe, pan, tap)

## For Designers

### Touch Target Guidelines

#### Minimum Sizes
- **Phone**: 44×44px minimum (Apple/Android standard)
- **Tablet**: 48×48px recommended
- **Primary Actions**: 56×56px recommended

#### Spacing
- **Minimum**: 8px between touch targets
- **Comfortable**: 16px between touch targets
- **Generous**: 24px+ for primary actions

#### Visual Feedback
All touch targets should have:
- ✅ Visible pressed state (darker/lighter)
- ✅ Scale or opacity change
- ✅ Optional ripple effect
- ✅ Clear hover state (desktop)

### Design Tokens

```css
/* Touch Target Sizes */
--touch-size-sm: 40px;
--touch-size: 44px;
--touch-size-lg: 48px;
--touch-size-xl: 56px;

/* Touch Spacing */
--touch-spacing: 8px;
--touch-spacing-comfortable: 16px;
--touch-spacing-generous: 24px;
```

### Common Patterns

#### Navigation Bar
```
Height: 56px minimum
Item width: 80-120px
Spacing: 8px between items
Active indicator: Clear visual
```

#### Action Buttons
```
Primary: 48×48px minimum
Secondary: 44×44px minimum
Icon only: 44×44px minimum
Floating: 56×56px recommended
```

#### List Items
```
Height: 56px minimum for tappable items
Spacing: 2px between items
Touch area: Full width
```

## Quick Reference

### CSS Classes
```css
.touch-target          /* 44×44px minimum */
.touch-feedback        /* Scale + opacity on touch */
.touch-ripple          /* Ripple animation */
.min-touch-sm          /* 40px minimum */
.min-touch             /* 44px minimum */
.min-touch-lg          /* 48px minimum */
.min-touch-xl          /* 56px minimum */
.touch-spacing         /* 8px spacing */
```

### Keyboard Shortcuts
```
Ctrl+Shift+T  - Toggle TapTestOverlay
```

### Console Commands
```javascript
window.auditTouchTargets()  // Run compliance audit
```

### Component Props
```jsx
// Button sizes (all meet minimum)
<Button size="sm">Small</Button>      // 44px
<Button size="default">Default</Button> // 44px
<Button size="lg">Large</Button>      // 48px
<Button size="icon">Icon</Button>     // 44px
```

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Material Design Touch Targets](https://material.io/design/layout/spacing-methods.html#touch-targets)
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Support

For questions or issues:
1. Check this guide first
2. Run the audit tool
3. Review `TOUCH_TARGETS_README.md`
4. Check the component implementation examples
