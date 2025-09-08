// storage.service.ts
// this file defines the StorageService which provides methods to interact with local storage
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(k: string): T | null {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) as T : null;
  }
  set<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }
  remove(k: string) { localStorage.removeItem(k); }
}
