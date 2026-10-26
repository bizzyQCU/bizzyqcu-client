# DotGridBackground Component

An interactive dot grid background with a spotlight effect that follows the user's pointer.

## Features

- **Faint dot grid** on 16px spacing across the entire background
- **Interactive spotlight** - dots near the pointer light up in accent color
- **Smooth transitions** - the light follows cursor movement with easing
- **Wandering effect** - light position stays where pointer left when cursor moves away
- **Accessibility** - respects `prefers-reduced-motion` for users with motion sensitivity
- **Customizable** - supports different accent colors via CSS classes

## Usage

### Basic Usage

```jsx
import { DotGridBackground } from '../components'

function MyPage() {
  return (
    <DotGridBackground>
      <div>Your content here</div>
    </DotGridBackground>
  )
}
```

### With Accent Color

```jsx
<DotGridBackground className="accent-amber">
  <div>Content with amber accent</div>
</DotGridBackground>

<DotGridBackground className="accent-blue">
  <div>Content with blue accent</div>
</DotGridBackground>
```

### Full Height Page

```jsx
<DotGridBackground className="flex-grow">
  <main className="flex items-center justify-center h-full">
    <div>Centered content</div>
  </main>
</DotGridBackground>
```

## Available Accent Colors

- **Default** (Blue): `#0A6CFF` - Standard blue accent
- **Amber**: `accent-amber` class - `#F59E0B` - Warm amber/gold
- **Blue**: `accent-blue` class - `#3B82F6` - Bright blue

## Customization

### Add New Accent Colors

Edit `DotGridBackground.css` and add a new variant:

```css
.dot-grid-container.accent-purple .dot-lit {
  background-image: radial-gradient(
    circle,
    #A855F7 1.7px,
    transparent 2.3px
  );
}

.dot-grid-container.accent-purple .dot-glow {
  background: radial-gradient(
    circle 120px at var(--x, 50%) var(--y, 50%),
    rgba(168, 85, 247, 0.2),
    transparent
  );
}
```

### Adjust Spotlight Size

In `DotGridBackground.css`, modify the circle radius:

```css
.dot-lit {
  /* Change 78px to increase/decrease lit area */
  mask-image: radial-gradient(
    circle 78px at var(--x, 50%) var(--y, 50%),
    #000,
    transparent
  );
}

.dot-glow {
  /* Change 120px to increase/decrease glow area */
  background: radial-gradient(
    circle 120px at var(--x, 50%) var(--y, 50%),
    rgba(79, 163, 255, 0.2),
    transparent
  );
}
```

### Change Grid Spacing

In `DotGridBackground.css`, modify `background-size`:

```css
.dot-grid {
  background-size: 16px 16px; /* Change both values equally */
}

.dot-lit {
  background-size: 16px 16px; /* Must match .dot-grid */
}
```

## Technical Details

### How It Works

1. **Three Layers**:
   - `.dot-grid` - Base layer with faint dots
   - `.dot-lit` - Identical dot grid in accent color, masked to show only near pointer
   - `.dot-glow` - Soft radial gradient glow effect

2. **CSS Custom Properties**:
   - `--x` and `--y` track pointer position
   - Updated via JavaScript on `pointermove` event
   - Used in `radial-gradient()` for positioning

3. **Masking**:
   - `mask-image` creates circular reveal effect
   - Only shows lit dots within the circle
   - Circle follows `--x` and `--y` values

### Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (WebKit)
- ⚠️ IE11 (not supported - gracefully degrades to static dots)

### Performance

- Lightweight - no canvas, no heavy animations
- GPU-accelerated - uses CSS transforms and masks
- Smooth 60fps - CSS transitions handle interpolation
- No memory leaks - event listener properly cleaned up

## Accessibility

- Respects `prefers-reduced-motion`
- When reduced motion is preferred:
  - Transitions are disabled
  - Spotlight still works but doesn't animate
  - Component is marked with `data-paused="1"`

## Credit

Based on the [BrewedOps Motion Library](https://brewedops.cloud/motionlibrary/?id=backgrounds-dot-spotlight) "Dot grid spotlight" pattern.

Adapted for React and customized for BizzyQCU.
