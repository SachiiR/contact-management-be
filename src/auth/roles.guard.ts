import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    //No roles required, so allow access
    if (!requiredRoles) {
      return true; 
    }
    const request = context.switchToHttp().getRequest();
    // User object is attached by the JWT strategy
    const user = request.user; 

    // Check if the user's role is included in the required roles
    return requiredRoles.some(role => user.role === role);
  }
}