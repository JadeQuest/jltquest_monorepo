declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export type ReactNode = any;
  export type ButtonHTMLAttributes<T> = any;
}

declare module 'react/jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
