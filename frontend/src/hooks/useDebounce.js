/**
 * FASE 5: Hook useDebounce
 * Debounce para búsquedas y otras operaciones que necesiten delay
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDebounce - Debounces a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback - Debounces a callback function
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * useThrottle - Throttles a value (fires at most once per delay)
 * @param {any} value - The value to throttle
 * @param {number} delay - Minimum time between updates (default: 300)
 */
export function useThrottle(value, delay = 300) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= delay) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, delay - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

export default useDebounce;
