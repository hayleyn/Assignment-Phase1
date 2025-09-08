// user.ts
// this file defines the User interface used in the application
import { Role } from "./roles";

export interface User {
    id: string;
    username: string;
    email: string;
    roles: Role[];
    groups: string[];
  }
  
  