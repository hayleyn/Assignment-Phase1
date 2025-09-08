// channel.ts
// this file defines the Channel interface used in the application
export interface Channel {
    id: string;
    groupId: string;
    name: string;
    bannedUsernames?: string[];
  }
  