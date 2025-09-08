//api.service.ts
// this file defines the ApiService which handles communication with the backend API for authentication
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>('/api/auth/login', { username, password });
  }

  logout(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>('/api/auth/logout', {});
  }
}
