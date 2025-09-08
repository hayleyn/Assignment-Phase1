// group.ts
// this file defines the Group interface used in the application
export interface Group {
    id: string;
    name: string;
    ownerUsername: string;
    adminUsernames: string[];
    memberUsernames: string[];
  }
  