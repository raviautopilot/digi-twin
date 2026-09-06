/* eslint-disable @typescript-eslint/no-unused-vars */
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    testId?: string;
    testid?: string;
  }
}
