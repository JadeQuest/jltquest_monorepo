import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to throttle value updates
 */
export function useThrottle<T>(value: T, intervalMs: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + intervalMs) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, intervalMs - (Date.now() - lastExecuted.current));

      return () => clearTimeout(timerId);
    }
  }, [value, intervalMs]);

  return throttledValue;
}
