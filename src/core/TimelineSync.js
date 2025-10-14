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
