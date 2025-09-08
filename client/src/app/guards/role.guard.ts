// role.guard.ts
// this file is used in app.routes.ts to protect routes that require specific roles
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    const roles = route.data['roles'] as string[] || [];
    return roles.length === 0 || roles.some(r => this.auth.hasRole(r));
  }
}
