// server/src/types.d.ts
import 'express'; // This MUST be at the very top for module augmentation
import { IUser } from './models/User'; // Ensure this path is correct

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add this line for the user property
    }
    interface Response {
      __: (phrase: string, ...args: any[]) => string;
      __n: (phrase: string, count: number, ...args: any[]) => string;
    }
  }
}