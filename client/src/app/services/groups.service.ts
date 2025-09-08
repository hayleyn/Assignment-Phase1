// groups.service.ts
// this file defines the GroupsService which manages groups and their administrators in the application
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../models/group';
import { Observable } from 'rxjs';

// GroupsService class definition
@Injectable({ providedIn: 'root' })
export class GroupsService {
  channels() {
      throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {}

  list(): Observable<Group[]> {
    return this.http.get<Group[]>('/api/groups');
  }

  create(name: string): Observable<Group> {
    return this.http.post<Group>('/api/groups', { name });
  }

  addAdmin(groupId: string, username: string): Observable<Group> {
    return this.http.post<Group>(`/api/groups/${groupId}/admins`, { username });
  }

  listGroups = this.list.bind(this);
  createGroup = this.create.bind(this);
  addGroupAdmin = this.addAdmin.bind(this);
}
