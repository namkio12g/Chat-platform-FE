import { useState, useEffect, useRef } from 'react';

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;

    if (timeSinceLastExecution >= delay) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, delay - timeSinceLastExecution);

      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}
