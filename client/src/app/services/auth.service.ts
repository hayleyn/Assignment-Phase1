// auth.service.ts
// this file defines the AuthService which manages user authentication state and interacts with the ApiService for login/logout
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User } from '../models/user';

type AuthState = { sessionToken: string; user: User };

// AuthService class definition
@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$ = new BehaviorSubject<User | null>(null);
  sessionToken: string | null = null;
  user$: any;

  constructor(private api: ApiService, private storage: StorageService) {
    const saved = this.storage.get<AuthState>('auth');
    if (saved) {
      this.sessionToken = saved.sessionToken;
      this.currentUser$.next(saved.user);
      localStorage.setItem('token', saved.sessionToken);
    }
  }

  login(username: string, password: string) {
    return this.api.login(username, password).pipe(
      tap((res: { token?: string; sessionToken?: string; user: User }) => {
        const sessionToken = res.sessionToken ?? res.token;
        if (!sessionToken) throw new Error('No session token returned');

        this.sessionToken = sessionToken;
        this.currentUser$.next(res.user);

        localStorage.setItem('token', sessionToken);
        this.storage.set<AuthState>('auth', { sessionToken, user: res.user });
      })
    );
  }

  logout() {
    if (this.sessionToken) this.api.logout().subscribe({ error: () => {} });
    this.sessionToken = null;
    localStorage.removeItem('token');
    this.currentUser$.next(null);
    this.storage.remove('auth');
  }

  hasRole(role: string) {
    return this.currentUser$.value?.roles?.includes(role as any) ?? false;
  }

  isAuthed() {
    return !!this.currentUser$.value;
  }
}
