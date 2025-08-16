// src/auth/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
        // Debug log
        console.log('User:', user, 'Err:', err, 'Info:', info);
    
        // You can throw your own error or return the user
        if (err || !user) {
          throw err || new UnauthorizedException();
        }
        return user;
      }
}
