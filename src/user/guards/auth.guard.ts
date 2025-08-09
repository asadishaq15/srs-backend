// src/auth/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.cookies['token']; // Get JWT from cookies

    if (!token) return false;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
      req['user'] = decoded; // Attach decoded data to request object
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
