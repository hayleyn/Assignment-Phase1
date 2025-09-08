// channels.service.ts
// this file defines the ChannelsService which manages channels and messages in the application
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Channel } from '../models/channel';
import { Message } from '../models/message';
import { Observable } from 'rxjs';

// ChannelsService class definition
@Injectable({ providedIn: 'root' })
export class ChannelsService {
  constructor(private http: HttpClient) {}

  listByGroup(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`/api/channels/group/${groupId}`);
  }

  create(groupId: string, name: string): Observable<Channel> {
    return this.http.post<Channel>('/api/channels', { groupId, name });
  }

  getMessages(channelId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/channels/${channelId}/messages`);
  }

  sendMessage(channelId: string, text: string): Observable<Message> {
    return this.http.post<Message>(`/api/channels/${channelId}/messages`, { text });
  }

  deleteChannel(channelId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/api/channels/${channelId}`);
  }
}
