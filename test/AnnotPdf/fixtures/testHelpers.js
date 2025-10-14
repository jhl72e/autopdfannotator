/**
 * Test Helper Utilities
 *
 * Provides utility functions for implementing AnnotPdf tests.
 */

// ============================================================================
// Test Result Tracking
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Log a test result
 */
export function logTest(resultsElement, name, passed, message = '') {
  testCount++;
  if (passed) passCount++;
  else failCount++;

  const div = document.createElement('div');
  div.className = `test-result ${passed ? 'test-pass' : 'test-fail'}`;
  div.innerHTML = `
    <strong>${passed ? '✅ PASS' : '❌ FAIL'}</strong>: ${name}
    ${message ? `<br><em>${message}</em>` : ''}
  `;
  resultsElement.appendChild(div);

  // Log to console
  console.log(`${passed ? '✅' : '❌'} ${name}${message ? ': ' + message : ''}`);
}

/**
 * Clear test results
 */
export function clearResults(resultsElement) {
  resultsElement.innerHTML = '';
  testCount = 0;
  passCount = 0;
  failCount = 0;
}

/**
 * Show test summary
 */
export function showSummary(resultsElement) {
  const div = document.createElement('div');
  div.className = `test-result ${failCount === 0 ? 'test-pass' : 'test-fail'}`;
  div.innerHTML = `
    <strong>Test Summary:</strong><br>
    Total: ${testCount}<br>
    Passed: ${passCount}<br>
    Failed: ${failCount}<br>
    Success Rate: ${testCount > 0 ? ((passCount / testCount) * 100).toFixed(1) : 0}%
  `;
  resultsElement.insertBefore(div, resultsElement.firstChild);

  console.log(`\n========== TEST SUMMARY ==========`);
  console.log(`Total: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success Rate: ${testCount > 0 ? ((passCount / testCount) * 100).toFixed(1) : 0}%`);
  console.log(`==================================\n`);
}

/**
 * Wait for condition to be true
 */
export function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        requestAnimationFrame(check);
      }
    };

    check();
  });
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy() {
  const calls = [];

  const spy = function(...args) {
    calls.push({
      args,
      timestamp: Date.now()
    });
  };

  spy.calls = calls;
  spy.callCount = () => calls.length;
  spy.lastCall = () => calls[calls.length - 1];
  spy.reset = () => { calls.length = 0; };

  return spy;
}

/**
 * Create a mock callback that returns specified value
 */
export function createMockCallback(returnValue) {
  const spy = createSpy();
  const mockFn = function(...args) {
    spy(...args);
    return returnValue;
  };

  mockFn.calls = spy.calls;
  mockFn.callCount = spy.callCount;
  mockFn.lastCall = spy.lastCall;
  mockFn.reset = spy.reset;

  return mockFn;
}

/**
 * Measure async execution time
 */
export async function measureTimeAsync(name, fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

  return {
    result,
    duration
  };
}

/**
 * Get current test stats
 */
export function getTestStats() {
  return {
    total: testCount,
    passed: passCount,
    failed: failCount,
    successRate: testCount > 0 ? (passCount / testCount) * 100 : 0
  };
}
