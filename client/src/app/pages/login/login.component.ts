// login.component.ts
// this file defines the LoginComponent which handles user authentication
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

//  Component decorator with metadata
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  template: `
    <div class="topbar">
        <div class="container row" style="justify-content: space-between; padding: 10px 0">
        <div class="brand">ChatterBox ✨</div>
        </div>
    </div>

    <div class="container" style="display:grid; place-items:center; min-height: 70vh">
        <div class="card pad" style="width:min(520px, 96vw)">
        <h2 style="margin-top:0">Welcome back 💜</h2>
        <p style="opacity:.8; margin-top:-6px">Sign in to start chatting.</p>

        <form class="stack" (ngSubmit)="submit()">
            <div class="stack">
            <label>Username</label>
            <input class="input" [(ngModel)]="username" name="u" placeholder="e.g. super" />
            </div>

            <div class="stack">
            <label>Password</label>
            <input class="input" [(ngModel)]="password" name="p" type="password" placeholder="••••••••" />
            </div>

            <div *ngIf="error" class="error">{{ error }}</div>

            <div class="row" style="justify-content:flex-end; margin-top:6px">
            <button class="btn btn-primary" type="submit">Sign in</button>
            </div>
        </form>
        </div>
    </div>
    `
    })

// LoginComponent class definition
export class LoginComponent {
  username = ''; password = ''; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  submit() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.error = 'Invalid credentials'
    });
  }
}
