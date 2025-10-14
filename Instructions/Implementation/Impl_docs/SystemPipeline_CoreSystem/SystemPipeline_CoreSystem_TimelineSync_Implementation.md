# TimelineSync Subsystem - Implementation Document

---

## What This Document Is

This document provides CODE-level implementation specifications for the TimelineSync subsystem. This is the second subsystem of the core engine that manages timeline position and notifies subscribers of timeline changes using a pub-sub pattern.

---

## Purpose

Create a pure JavaScript class that manages timeline state and provides a subscriber notification system for timeline updates. This module enables timeline synchronization for annotation animations in both discrete (manual) and continuous (audio/video) modes.

---

## File Location

**File Path:** `src/core/TimelineSync.js`

**Module Type:** ES6 JavaScript class (no JSX, no React, no external dependencies)

---

## Dependencies

### External Libraries

**None** - This is a pure JavaScript module with zero dependencies.

### Internal Utilities

**None** - Uses only standard browser APIs (`requestAnimationFrame`, `cancelAnimationFrame`).

---

## Class Structure

### Class Definition

```javascript
/**
 * TimelineSync - Framework-agnostic timeline synchronization subsystem
 *
 * Manages timeline position and notifies subscribers of changes.
 * Supports both discrete updates (manual setTime) and continuous
 * synchronization via requestAnimationFrame for audio/video.
 *
 * @class
 */
export class TimelineSync {
  constructor() {
    // Implementation details below
  }
}
```

---

## Constructor Implementation

### Signature

```javascript
constructor()
```

### Implementation

```javascript
constructor() {
  /**
   * @private
   * @type {number}
   * @description Current timeline position in seconds
   */
  this.currentTime = 0;

  /**
   * @private
   * @type {Set<Function>}
   * @description Set of subscriber callback functions
   */
  this.subscribers = new Set();

  /**
   * @private
   * @type {number|null}
   * @description requestAnimationFrame ID for continuous sync
   */
  this.animationFrameId = null;

  /**
   * @private
   * @type {boolean}
   * @description Flag indicating if continuous sync is running
   */
  this.isRunning = false;
}
```

### State Initialization

- `currentTime`: Initialize to `0` seconds
- `subscribers`: Use `Set` for O(1) add/remove operations and automatic duplicate prevention
- `animationFrameId`: Initialize to `null` (no continuous sync active)
- `isRunning`: Initialize to `false` (continuous sync not running)

---

## Public Methods

### Method 1: setTime()

#### Signature

```javascript
/**
 * Set timeline position and notify subscribers if changed
 *
 * Only notifies subscribers if the time value actually changed,
 * preventing redundant updates and re-renders.
 *
 * @param {number} timestamp - Timeline position in seconds
 * @returns {void}
 */
setTime(timestamp)
```

#### Implementation

```javascript
setTime(timestamp) {
  // Skip if no change (optimization)
  if (timestamp === this.currentTime) {
    return;
  }

  // Update current time
  this.currentTime = timestamp;

  // Notify all subscribers
  this.notifySubscribers();
}
```

#### Behavior

- **Change Detection:** Only proceed if timestamp differs from currentTime
- **State Update:** Store new timestamp in currentTime
- **Notification:** Call notifySubscribers() to inform all listeners
- **Optimization:** Prevents unnecessary notifications when time hasn't changed

---

### Method 2: getCurrentTime()

#### Signature

```javascript
/**
 * Get current timeline position
 *
 * @returns {number} Current timeline position in seconds
 */
getCurrentTime()
```

#### Implementation

```javascript
getCurrentTime() {
  return this.currentTime;
}
```

#### Behavior

- **Simple Getter:** Returns current timeline position
- **No Side Effects:** Read-only operation

---

### Method 3: subscribe()

#### Signature

```javascript
/**
 * Subscribe to timeline updates
 *
 * Registers a callback function to be notified when timeline position changes.
 * Returns an unsubscribe function for convenient cleanup.
 *
 * @param {Function} callback - Function to call on timeline updates, receives current time as parameter
 * @returns {Function} Unsubscribe function to remove this callback
 * @throws {Error} If callback is not a function
 */
subscribe(callback)
```

#### Implementation

```javascript
subscribe(callback) {
  // Validate callback
  if (typeof callback !== 'function') {
    throw new Error('TimelineSync.subscribe: callback must be a function');
  }

  // Add to subscribers set
  this.subscribers.add(callback);

  // Return unsubscribe function for convenience
  return () => this.unsubscribe(callback);
}
```

#### Behavior

- **Validation:** Throw error if callback is not a function
- **Registration:** Add callback to subscribers Set
- **Convenience Return:** Return unsubscribe function bound to this callback
- **Duplicate Prevention:** Set automatically prevents duplicate subscriptions

#### Usage Example

```javascript
// With unsubscribe function
const unsubscribe = timelineSync.subscribe((time) => {
  console.log('Time updated:', time);
});

// Later, cleanup
unsubscribe();
```

---

### Method 4: unsubscribe()

#### Signature

```javascript
/**
 * Unsubscribe from timeline updates
 *
 * Removes a previously registered callback function.
 * Safe to call even if callback was never subscribed.
 *
 * @param {Function} callback - Callback function to remove
 * @returns {void}
 */
unsubscribe(callback)
```

#### Implementation

```javascript
unsubscribe(callback) {
  // Remove from subscribers set
  // Set.delete() is safe even if callback doesn't exist
  this.subscribers.delete(callback);
}
```

#### Behavior

- **Removal:** Delete callback from subscribers Set
- **Safe Operation:** No error if callback wasn't subscribed
- **Idempotent:** Safe to call multiple times

---

### Method 5: startContinuousSync()

#### Signature

```javascript
/**
 * Start continuous timeline synchronization
 *
 * Starts a requestAnimationFrame loop that continuously reads time
 * from the provided getter function and updates the timeline.
 * Useful for syncing with audio/video elements.
 *
 * @param {Function} getTimeFunction - Function that returns current time (e.g., () => audio.currentTime)
 * @returns {void}
 */
startContinuousSync(getTimeFunction)
```

#### Implementation

```javascript
startContinuousSync(getTimeFunction) {
  // Validate input
  if (typeof getTimeFunction !== 'function') {
    throw new Error('TimelineSync.startContinuousSync: getTimeFunction must be a function');
  }

  // Prevent multiple simultaneous sync loops
  if (this.isRunning) {
    console.warn('TimelineSync: Continuous sync already running');
    return;
  }

  // Mark as running
  this.isRunning = true;

  // Define animation loop
  const syncLoop = () => {
    // Exit if stopped
    if (!this.isRunning) {
      return;
    }

    try {
      // Get current time from source
      const newTime = getTimeFunction();

      // Update timeline (will notify subscribers if changed)
      this.setTime(newTime);
    } catch (err) {
      console.error('TimelineSync: Error in continuous sync:', err);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(syncLoop);
  };

  // Start the loop
  syncLoop();
}
```

#### Behavior

- **Validation:** Throw error if getTimeFunction is not a function
- **Guard:** Prevent multiple simultaneous sync loops
- **RAF Loop:** Use requestAnimationFrame for smooth 60fps updates
- **Error Handling:** Catch errors in getTimeFunction to prevent loop breakage
- **State Update:** Call setTime() which handles change detection
- **Cleanup Tracking:** Store animationFrameId for cancellation

#### Usage Example

```javascript
// Sync with audio element
const audio = document.getElementById('narration');
timelineSync.startContinuousSync(() => audio.currentTime);

// Timeline now updates automatically at ~60fps while audio plays
```

---

### Method 6: stopContinuousSync()

#### Signature

```javascript
/**
 * Stop continuous timeline synchronization
 *
 * Cancels the requestAnimationFrame loop started by startContinuousSync.
 * Safe to call even if continuous sync is not running.
 *
 * @returns {void}
 */
stopContinuousSync()
```

#### Implementation

```javascript
stopContinuousSync() {
  // Mark as not running
  this.isRunning = false;

  // Cancel animation frame if exists
  if (this.animationFrameId !== null) {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
}
```

#### Behavior

- **Stop Flag:** Set isRunning to false (stops loop on next iteration)
- **Frame Cancellation:** Cancel pending requestAnimationFrame
- **Cleanup:** Clear animationFrameId reference
- **Idempotent:** Safe to call multiple times

---

### Method 7: destroy()

#### Signature

```javascript
/**
 * Clean up resources and release references
 *
 * Call this method when TimelineSync is no longer needed.
 * After calling destroy(), the instance should not be used.
 *
 * @returns {void}
 */
destroy()
```

#### Implementation

```javascript
destroy() {
  // Stop continuous sync if running
  this.stopContinuousSync();

  // Clear all subscribers
  this.subscribers.clear();

  // Reset state
  this.currentTime = 0;
}
```

#### Behavior

- **Sync Cleanup:** Stop continuous sync if active
- **Subscriber Cleanup:** Clear all registered callbacks
- **State Reset:** Reset currentTime to 0
- **Complete Cleanup:** Prepare instance for garbage collection

---

## Private Methods

### Private Method: notifySubscribers()

#### Signature

```javascript
/**
 * Notify all subscribers of current time
 *
 * @private
 * @returns {void}
 */
notifySubscribers()
```

#### Implementation

```javascript
notifySubscribers() {
  // Iterate through all subscribers
  for (const callback of this.subscribers) {
    try {
      // Call callback with current time
      callback(this.currentTime);
    } catch (err) {
      // Log error but continue notifying others
      // One subscriber error should not break other subscribers
      console.error('TimelineSync: Subscriber callback error:', err);
    }
  }
}
```

#### Behavior

- **Iteration:** Loop through all subscribers in Set
- **Invocation:** Call each callback with currentTime as parameter
- **Error Isolation:** Wrap each call in try-catch
- **Robustness:** Continue notifying remaining subscribers even if one fails
- **Error Logging:** Log errors for debugging without breaking system

#### Critical Design Decision

**Error isolation is critical for robustness:**
- One misbehaving subscriber cannot break the entire system
- All subscribers receive notifications even if one throws an error
- Errors are logged for debugging
- System remains stable under error conditions

---

## Complete Implementation File

### Full Code

```javascript
/**
 * TimelineSync - Framework-agnostic timeline synchronization subsystem
 *
 * This module manages timeline position and provides a subscriber notification
 * system for timeline updates. Supports both discrete updates (manual setTime)
 * and continuous synchronization via requestAnimationFrame for audio/video.
 *
 * @module core/TimelineSync
 */

/**
 * TimelineSync class
 *
 * Provides timeline state management and pub-sub notification system.
 * Zero dependencies - pure JavaScript implementation.
 *
 * @class
 * @example
 * // Discrete mode
 * const sync = new TimelineSync();
 * sync.subscribe((time) => console.log('Time:', time));
 * sync.setTime(5.0);
 *
 * @example
 * // Continuous mode with audio
 * const audio = document.getElementById('audio');
 * sync.startContinuousSync(() => audio.currentTime);
 */
export class TimelineSync {
  constructor() {
    /**
     * @private
     * @type {number}
     */
    this.currentTime = 0;

    /**
     * @private
     * @type {Set<Function>}
     */
    this.subscribers = new Set();

    /**
     * @private
     * @type {number|null}
     */
    this.animationFrameId = null;

    /**
     * @private
     * @type {boolean}
     */
    this.isRunning = false;
  }

  /**
   * Set timeline position and notify subscribers if changed
   *
   * @param {number} timestamp - Timeline position in seconds
   * @returns {void}
   */
  setTime(timestamp) {
    if (timestamp === this.currentTime) {
      return;
    }

    this.currentTime = timestamp;
    this.notifySubscribers();
  }

  /**
   * Get current timeline position
   *
   * @returns {number} Current timeline position in seconds
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Subscribe to timeline updates
   *
   * @param {Function} callback - Function to call on timeline updates
   * @returns {Function} Unsubscribe function
   * @throws {Error} If callback is not a function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('TimelineSync.subscribe: callback must be a function');
    }

    this.subscribers.add(callback);

    return () => this.unsubscribe(callback);
  }

  /**
   * Unsubscribe from timeline updates
   *
   * @param {Function} callback - Callback function to remove
   * @returns {void}
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  /**
   * Start continuous timeline synchronization
   *
   * @param {Function} getTimeFunction - Function that returns current time
   * @returns {void}
   * @throws {Error} If getTimeFunction is not a function
   */
  startContinuousSync(getTimeFunction) {
    if (typeof getTimeFunction !== 'function') {
      throw new Error('TimelineSync.startContinuousSync: getTimeFunction must be a function');
    }

    if (this.isRunning) {
      console.warn('TimelineSync: Continuous sync already running');
      return;
    }

    this.isRunning = true;

    const syncLoop = () => {
      if (!this.isRunning) {
        return;
      }

      try {
        const newTime = getTimeFunction();
        this.setTime(newTime);
      } catch (err) {
        console.error('TimelineSync: Error in continuous sync:', err);
      }

      this.animationFrameId = requestAnimationFrame(syncLoop);
    };

    syncLoop();
  }

  /**
   * Stop continuous timeline synchronization
   *
   * @returns {void}
   */
  stopContinuousSync() {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Clean up resources and release references
   *
   * @returns {void}
   */
  destroy() {
    this.stopContinuousSync();
    this.subscribers.clear();
    this.currentTime = 0;
  }

  /**
   * Notify all subscribers of current time
   *
   * @private
   * @returns {void}
   */
  notifySubscribers() {
    for (const callback of this.subscribers) {
      try {
        callback(this.currentTime);
      } catch (err) {
        console.error('TimelineSync: Subscriber callback error:', err);
      }
    }
  }
}
```

---

## Usage Examples

### Example 1: Basic Discrete Mode

```javascript
import { TimelineSync } from './core/TimelineSync.js';

// Create instance
const timelineSync = new TimelineSync();

// Subscribe to updates
timelineSync.subscribe((time) => {
  console.log('Current time:', time);
  // Update UI, animations, etc.
});

// Manually update time (e.g., from slider, video controls)
timelineSync.setTime(0.0);   // Time: 0.0
timelineSync.setTime(2.5);   // Time: 2.5
timelineSync.setTime(5.0);   // Time: 5.0

// Clean up
timelineSync.destroy();
```

### Example 2: Multiple Subscribers

```javascript
const timelineSync = new TimelineSync();

// Layer manager subscriber
timelineSync.subscribe((time) => {
  layerManager.updateTimeline(time);
});

// UI progress bar subscriber
timelineSync.subscribe((time) => {
  progressBar.value = time;
});

// Analytics subscriber
timelineSync.subscribe((time) => {
  analytics.trackTimelinePosition(time);
});

// All subscribers notified simultaneously
timelineSync.setTime(10.0);
```

### Example 3: Unsubscribe with Returned Function

```javascript
const timelineSync = new TimelineSync();

// Subscribe and store unsubscribe function
const unsubscribe = timelineSync.subscribe((time) => {
  console.log('Temporary listener:', time);
});

timelineSync.setTime(1.0);  // Listener called

// Remove subscription
unsubscribe();

timelineSync.setTime(2.0);  // Listener NOT called
```

### Example 4: Continuous Sync with Audio

```javascript
const timelineSync = new TimelineSync();
const audio = document.getElementById('narration-audio');

// Subscribe layer manager
timelineSync.subscribe((time) => {
  layerManager.updateTimeline(time);
});

// Start continuous sync with audio
timelineSync.startContinuousSync(() => audio.currentTime);

// Play audio - timeline updates automatically at ~60fps
audio.play();

// Later, stop sync
audio.pause();
timelineSync.stopContinuousSync();
```

### Example 5: Continuous Sync with Video

```javascript
const timelineSync = new TimelineSync();
const video = document.getElementById('lecture-video');

// Subscribe annotations
timelineSync.subscribe((time) => {
  annotationRenderer.setTime(time);
});

// Sync with video playback
timelineSync.startContinuousSync(() => video.currentTime);

// Video controls automatically drive timeline
video.play();   // Annotations animate with video
video.pause();  // Annotations freeze
video.currentTime = 30;  // Annotations jump to 30s

// Cleanup when done
video.addEventListener('ended', () => {
  timelineSync.stopContinuousSync();
});
```

### Example 6: Error Handling in Subscribers

```javascript
const timelineSync = new TimelineSync();

// Subscriber that throws error
timelineSync.subscribe((time) => {
  if (time > 10) {
    throw new Error('Invalid time!');
  }
  console.log('Subscriber 1:', time);
});

// Other subscribers still work
timelineSync.subscribe((time) => {
  console.log('Subscriber 2:', time);
});

timelineSync.setTime(5.0);   // Both subscribers work
timelineSync.setTime(15.0);  // Subscriber 1 errors (logged), Subscriber 2 still works
```

---

## Integration Points

### Used By

- `AnnotationRenderer` (Step 4) - Main engine facade subscribes to timeline updates

### Notifies

- `LayerManager` (via AnnotationRenderer subscription) - Receives timeline updates to trigger layer animations

### Independent From

- PDFRenderer - No interaction
- Layer classes - No direct interaction (notifies via LayerManager)
- React or any framework - Pure JavaScript

### Integration Pattern

**How AnnotationRenderer uses TimelineSync:**

```javascript
// In AnnotationRenderer constructor
this.timelineSync = new TimelineSync();

// Wire up LayerManager to receive timeline updates
this.timelineSync.subscribe((time) => {
  this.layerManager.updateTimeline(time);
});

// Public API for consumers
setTime(timestamp) {
  // Forward to TimelineSync
  this.timelineSync.setTime(timestamp);
  // TimelineSync automatically notifies LayerManager via subscription
}
```

**Data Flow:**

```
User calls renderer.setTime(5.2)
  ↓
TimelineSync.setTime(5.2)
  ↓
TimelineSync.notifySubscribers()
  ↓
LayerManager.updateTimeline(5.2)
  ↓
All layers receive update and animate
```

---

## Testing Strategy

### Manual Testing Approach

Create a simple test script to verify TimelineSync independently:

**File:** `test/timelinesync-test.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>TimelineSync Test</title>
</head>
<body>
  <h1>TimelineSync Test</h1>
  <div>
    <button id="set-0">Set Time 0</button>
    <button id="set-5">Set Time 5</button>
    <button id="set-10">Set Time 10</button>
    <button id="start-continuous">Start Continuous</button>
    <button id="stop-continuous">Stop Continuous</button>
    <button id="test-error">Test Error Handling</button>
  </div>
  <div id="output"></div>

  <script type="module">
    import { TimelineSync } from '../src/core/TimelineSync.js';

    const timelineSync = new TimelineSync();
    const output = document.getElementById('output');

    function log(message) {
      const p = document.createElement('p');
      p.textContent = message;
      output.appendChild(p);
    }

    // Test 1: Basic subscription
    timelineSync.subscribe((time) => {
      log(`Subscriber 1 received: ${time}`);
    });

    // Test 2: Multiple subscribers
    timelineSync.subscribe((time) => {
      log(`Subscriber 2 received: ${time}`);
    });

    // Test 3: Unsubscribe
    const unsubscribe = timelineSync.subscribe((time) => {
      log(`Temporary subscriber received: ${time}`);
    });
    setTimeout(() => {
      unsubscribe();
      log('Temporary subscriber unsubscribed');
    }, 2000);

    // Button handlers
    document.getElementById('set-0').onclick = () => {
      timelineSync.setTime(0);
    };

    document.getElementById('set-5').onclick = () => {
      timelineSync.setTime(5);
    };

    document.getElementById('set-10').onclick = () => {
      timelineSync.setTime(10);
    };

    // Test 4: Continuous sync
    let simulatedTime = 0;
    document.getElementById('start-continuous').onclick = () => {
      simulatedTime = 0;
      timelineSync.startContinuousSync(() => {
        simulatedTime += 0.016; // Simulate 60fps
        return simulatedTime;
      });
      log('Started continuous sync');
    };

    document.getElementById('stop-continuous').onclick = () => {
      timelineSync.stopContinuousSync();
      log('Stopped continuous sync');
    };

    // Test 5: Error handling
    document.getElementById('test-error').onclick = () => {
      timelineSync.subscribe((time) => {
        throw new Error('Test error from subscriber');
      });
      timelineSync.setTime(99);
      log('Error test completed - check console');
    };

    log('TimelineSync test ready');
  </script>
</body>
</html>
```

### Test Checklist

**Basic Functionality:**
- ✅ setTime() updates current time
- ✅ getCurrentTime() returns correct value
- ✅ setTime() with same value doesn't notify (optimization)
- ✅ setTime() with different value notifies subscribers

**Subscription Management:**
- ✅ subscribe() adds callback to subscribers
- ✅ subscribe() returns unsubscribe function
- ✅ subscribe() throws error for non-function
- ✅ unsubscribe() removes callback
- ✅ unsubscribe() is safe to call multiple times

**Multiple Subscribers:**
- ✅ Multiple subscribers all receive notifications
- ✅ Subscribers notified in order of registration
- ✅ Adding subscriber during notification doesn't break system

**Error Handling:**
- ✅ Subscriber error doesn't break other subscribers
- ✅ Subscriber error is logged to console
- ✅ System remains stable after subscriber error

**Continuous Sync:**
- ✅ startContinuousSync() begins RAF loop
- ✅ startContinuousSync() throws error for non-function
- ✅ startContinuousSync() prevents multiple loops
- ✅ RAF loop calls getTimeFunction each frame
- ✅ RAF loop updates timeline via setTime()
- ✅ stopContinuousSync() cancels RAF
- ✅ stopContinuousSync() is safe to call when not running

**Cleanup:**
- ✅ destroy() stops continuous sync
- ✅ destroy() clears all subscribers
- ✅ destroy() resets currentTime

---

## Performance Considerations

### Change Detection Optimization

**setTime() skips notification if time unchanged:**
```javascript
if (timestamp === this.currentTime) {
  return;  // No notification
}
```

**Benefits:**
- Prevents redundant layer updates
- Avoids unnecessary re-renders
- Reduces CPU usage during static periods
- Important for continuous sync mode

### requestAnimationFrame Efficiency

**Continuous sync uses RAF instead of setInterval:**
- Synchronized with browser repaint cycle (~60fps)
- Automatically throttled when tab is inactive
- Better performance than polling with setInterval
- Smooth animations without frame drops

### Subscriber Set Performance

**Using Set instead of Array:**
- O(1) add operation vs O(1) push (similar)
- O(1) delete operation vs O(n) filter/splice
- No duplicate callbacks automatically
- Efficient iteration with for...of

### Error Isolation Performance

**Try-catch per subscriber:**
- Minimal overhead for normal operation
- Critical for system stability
- Better than one try-catch around all (would stop on first error)

---

## Architecture Patterns

### Observer Pattern (Pub-Sub)

TimelineSync implements the classic observer pattern:

**Publisher:** TimelineSync (manages state, notifies changes)
**Subscribers:** LayerManager, UI components, analytics, etc.
**Event:** Timeline position change

**Benefits:**
- Decoupling: Subscribers don't know about each other
- Scalability: Easy to add new subscribers
- Maintainability: Each subscriber handles its own logic

### Two Operating Modes

**Discrete Mode (Pull):**
- Consumer manually calls setTime()
- Used for: Sliders, step controls, manual navigation
- Lower CPU usage (updates only when needed)

**Continuous Mode (Push):**
- TimelineSync automatically polls time source
- Used for: Audio/video synchronization
- Smooth 60fps updates

Both modes use same notification mechanism (notifySubscribers).

---

## Notes

### Framework Independence

- No React, Vue, or any framework code
- Pure JavaScript ES6 classes
- Standard browser APIs only
- Works in any JavaScript environment

### Zero Dependencies

- No external libraries needed
- No utility functions required
- Completely self-contained
- Easy to test in isolation

### Design Decisions

**Why Set for subscribers?**
- O(1) operations
- Automatic duplicate prevention
- Clean iteration

**Why return unsubscribe function?**
- Convenient cleanup pattern
- Popular in React (useEffect, useState)
- Reduces boilerplate

**Why error isolation?**
- One bad subscriber can't break system
- Critical for robustness
- Better debugging (errors logged individually)

**Why support continuous sync?**
- Essential for audio/video use cases
- Makes library more versatile
- Doesn't complicate basic usage

### Future Enhancements

- Add support for playback rate (speed adjustment)
- Add support for time ranges (seek boundaries)
- Add events: onTimeUpdate, onStart, onStop
- Add debugging mode with verbose logging

---
