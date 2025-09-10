//group-detail.component.ts
// this file defines the GroupDetailComponent which manages the details of a specific group, including its channels and admins
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChannelsService } from '../../services/channels.service';
import { GroupsService } from '../../services/groups.service';
import { Channel } from '../../models/channel';
import { Group } from '../../models/group';

// Component decorator with metadata
@Component({
  standalone: true,
  selector: 'app-group-detail',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="topbar">
    <div class="container row" style="justify-content: space-between; padding: 10px 0">
      <div class="brand">ChatterBox ✨</div>
      <div class="row">
        <button class="btn btn-ghost" (click)="back()">Back</button>
      </div>
    </div>
  </div>

  <div class="container stack">

    <div class="card pad">
      <h2 style="margin-top:0">Channels</h2>
      <div class="channels">
        <div class="channels-item" *ngFor="let c of channelList" (click)="open(c)"># {{ c.name }}</div>
      </div>
    </div>

    <div class="card pad" *ngIf="canAdminThisGroup">
      <h3 style="margin-top:0">Create Channel</h3>
      <div class="row">
        <input class="input" style="flex:1" [(ngModel)]="name" placeholder="Channel name (e.g. general)" />
        <button class="btn btn-primary" (click)="create()">Create</button>
      </div>
    </div>

    <div class="card pad" *ngIf="canOwnerOrSuper">
      <h3 style="margin-top:0">Admins (this group)</h3>

      <div class="row" style="gap:8px; flex-wrap: wrap; margin-bottom: 8px" *ngIf="currentGroup">
        <span *ngFor="let u of currentGroup.adminUsernames"
              style="padding:6px 10px; border-radius:999px; background:rgba(255,255,255,.85); border:1px solid rgba(200,155,255,.35)">
          {{ u }}
        </span>
      </div>

      <div class="row">
        <input class="input" style="flex:1" [(ngModel)]="adminUsername" placeholder="Username to add as admin" />
        <button class="btn btn-primary" (click)="addAdmin()">Add admin</button>
      </div>

      <div *ngIf="adminError" class="error" style="margin-top:8px">{{ adminError }}</div>
    </div>

  </div>
  `
})
// GroupDetailComponent class definition
export class GroupDetailComponent implements OnInit {
    groupId = '';
  channelList: Channel[] = [];
  name = '';

  currentGroup: Group | null = null;
  canAdminThisGroup = false;
  canOwnerOrSuper = false;

  adminUsername = '';
  adminError = '';

  constructor(
    private route: ActivatedRoute,
    private channels: ChannelsService,
    private groups: GroupsService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id')!;

    // Load channels for this group
    this.channels.listByGroup(this.groupId).subscribe((cs: Channel[]) => (this.channelList = cs));

    // Load groups, find current, compute permissions
    this.groups.list().subscribe((gs: Group[]) => {
      this.currentGroup = gs.find(g => g.id === this.groupId) || null;
      const me = this.auth.currentUser$.value?.username ?? '';
      const isSuper = this.auth.hasRole('SUPER');
      const isGroupAdmin = !!this.currentGroup?.adminUsernames.includes(me);
      const isOwner = this.currentGroup?.ownerUsername === me;

      this.canAdminThisGroup = isSuper || isGroupAdmin;
      this.canOwnerOrSuper = isSuper || !!isOwner;
    });
  }

  open(c: Channel) {
    this.router.navigate(['/channels', c.id]);
  }

  create() {
    const n = this.name.trim();
    if (!n) return;
    this.channels.create(this.groupId, n).subscribe((c: Channel) => {
      this.channelList = [...this.channelList, c];
      this.name = '';
    });
  }

  addAdmin() {
    this.adminError = '';
    const u = this.adminUsername.trim();
    if (!u) return;

    this.groups.addAdmin(this.groupId, u).subscribe({
      next: (g: Group) => {
        this.currentGroup = g;
        this.adminUsername = '';
      },
      error: (err: any) => {
        this.adminError = err?.error?.error || 'Failed to add admin';
      },
    });
  }

  back() {
    this.router.navigateByUrl('/');
  }
}
