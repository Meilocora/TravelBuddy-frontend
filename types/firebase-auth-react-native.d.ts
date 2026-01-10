import 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: any): any;
}

export {};
