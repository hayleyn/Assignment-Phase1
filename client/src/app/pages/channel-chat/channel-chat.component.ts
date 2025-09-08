// channel-chat.component.ts
// this file defines the ChannelChatComponent which handles the chat functionality within a channel
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';          
import { ChannelsService } from '../../services/channels.service';
import { Message } from '../../models/message';

// Component decorator with metadata
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-channel-chat',
  template: `
    <div class="topbar">
      <div class="container row" style="justify-content: space-between; padding: 10px 0">
        <div class="brand">ChatterBox ✨</div>
        <div class="row">
          <button class="btn btn-ghost" routerLink="/">All Groups</button>
        </div>
      </div>
    </div>

    <div class="container stack">
      <div class="chat-window">
        <div class="stack">
          <div class="messages" *ngFor="let m of messages">
            <div class="meta">{{ m.username }} • {{ m.ts | date:'short' }}</div>
            <div>{{ m.text }}</div>
          </div>
        </div>
      </div>

      <form class="row" (ngSubmit)="send()">
        <input class="input" [(ngModel)]="text" name="t" placeholder="Write a lovely message…" />
        <button class="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  `
})

// ChannelChatComponent class definition
export class ChannelChatComponent implements OnInit {
    channelId = '';
    messages: Message[] = [];
  text = '';

  constructor(private route: ActivatedRoute, private channels: ChannelsService) {}

  ngOnInit() {
    this.channelId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.channels.getMessages(this.channelId).subscribe((ms: Message[]) => (this.messages = ms));
  }

  send() {
    const t = this.text.trim();
    if (!t) return;
    this.channels.sendMessage(this.channelId, t).subscribe((m: Message) => {
      this.messages = [...this.messages, m];
      this.text = '';
    });
  }
}
