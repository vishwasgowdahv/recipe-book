// server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose'; // Make sure this is imported

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add user property to Request object
    }

    interface Response {
      __: (phrase: string, ...args: any[]) => string;
      __n: (phrase: string, count: number, ...args: any[]) => string;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  console.log("--- DEBUG: Protect middleware initiated ---"); // Debug log 1

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log("DEBUG: Token extracted (first 10 chars):", token ? token.substring(0, 10) + '...' : 'No token'); // Debug log 2

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as JwtPayload;
      console.log("DEBUG: Decoded JWT ID:", decoded.id); // Debug log 3
      

      // Get user from the token
      req.user = (await User.findById(decoded.id).select('-password')) as IUser;
      console.log("DEBUG: User attached to req.user:", req.user ? req.user.username : 'User not found'); // Debug log 4

      if (!req.user) {
        console.error("ERROR: User not found in DB after token verification.");
        return res.status(401).json({ message: res.__('not_authorized_user_not_found') });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error: any) {
      console.error("ERROR: Token verification failed:", error.message); // Debug log 5
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: res.__('not_authorized_token_expired') });
      }
      return res.status(401).json({ message: res.__('not_authorized_token_failed') });
    }
  }

  if (!token) {
    console.error("ERROR: No token found in authorization header."); // Debug log 6
    return res.status(401).json({ message: res.__('not_authorized_no_token') });
  }
};