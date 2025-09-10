// dashboard.component.ts
// this file defines the DashboardComponent which serves as the main dashboard for users to view and manage their groups
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';
import { Group } from '../../models/group';

// Component decorator with metadata
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="topbar">
      <div class="container row" style="justify-content: space-between; padding: 10px 0">
        <div class="brand">ChatterBox ✨</div>
        <div class="row">
          <button class="btn btn-ghost" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>

    <div class="container stack">
      <div class="card pad">
        <h2>Your Groups</h2>
        <p *ngIf="loading">Loading…</p>
        <div *ngIf="error" class="error">{{ error }}</div>

        <div *ngIf="groups.length; else none" class="list">
          <div class="list-item" *ngFor="let g of groups" (click)="open(g)">
            {{ g.name }}
          </div>
        </div>
        <ng-template #none><p style="opacity:.8">No groups yet.</p></ng-template>
      </div>

      <div class="card pad" *ngIf="isAdmin()">
        <h3 style="margin-top:0">Create Group</h3>
        <div class="row">
          <input class="input" style="flex:1" [(ngModel)]="newGroupName" name="groupName" placeholder="Group name (e.g. G1)" />
          <button class="btn btn-primary" (click)="create()">Create</button>
        </div>
      </div>
    </div>
  `
})
// DashboardComponent class definition
export class DashboardComponent implements OnInit {
  groups: Group[] = [];
  newGroupName = '';
  loading = false;
  error = '';

  constructor(
    private groupsSvc: GroupsService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchGroups();
  }

  fetchGroups(): void {
    this.loading = true;
    this.error = '';
    this.groupsSvc.list().subscribe({
      next: (list: Group[]) => { this.groups = list; this.loading = false; },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.error || 'Failed to load groups';
      }
    });
  }

  isAdmin(): boolean {
    return this.auth.hasRole('SUPER') || this.auth.hasRole('GROUP_ADMIN');
  }

  open(g: Group): void {
    this.router.navigate(['/groups', g.id]);
  }

  create(): void {
    const name = this.newGroupName.trim();
    if (!name) return;
    this.groupsSvc.create(name).subscribe({
      next: (g: Group) => { this.groups = [...this.groups, g]; this.newGroupName = ''; },
      error: (err: any) => {
        this.error = err?.error?.error || 'Failed to create group';
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
