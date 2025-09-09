# Overview
Phase 1 delivers a simple chat backend (Express) and frontend (Angular). Data is stored in data.json and loaded into in‑memory Maps; every mutation calls save() to persist back to disk. Authentication uses random UUID session tokens; role checks gate protected routes.

# Tech stack
  Backend: Node.js, Express, CORS

  Frontend: Angular 

  Realtime (later phases): Socket.io, Peer.js (not implemented yet in Phase 1)

  Persistence: JSON file via fs.writeFileSync

# Repository layout
Text-Video-Chat-System/

├─ client/

│  ├─ .angular/                     # Angular CLI build/dev cache (not committed)

│  ├─ .vscode/                      # Editor workspace settings (optional)

│  ├─ node_modules/                 # Installed deps (generated)

│  ├─ public/                       # Static public assets (served as-is)

│  ├─ src/

│  │  ├─ app/

│  │  │  ├─ guards/

│  │  │  │  ├─ auth.guard.ts

│  │  │  │  └─ role.guard.ts

│  │  │  ├─ interceptors/

│  │  │  │  └─ auth.interceptor.ts  # Attaches Authorization header with token

│  │  │  ├─ models/

│  │  │  │  ├─ channel.ts

│  │  │  │  ├─ group.ts

│  │  │  │  ├─ message.ts

│  │  │  │  ├─ roles.ts

│  │  │  │  └─ user.ts

│  │  │  ├─ pages/

│  │  │  │  ├─ channel-chat/        # Chat UI for a single channel

│  │  │  │  ├─ dashboard/           # Groups/channels overview

│  │  │  │  ├─ group-detail/        # Channels within a group

│  │  │  │  └─ login/               # Login screen

│  │  │  ├─ services/

│  │  │  │  ├─ api.service.ts       # Thin HTTP wrapper (relative URLs/proxy)

│  │  │  │  ├─ auth.service.ts      # currentUser$, sessionToken persistence

│  │  │  │  ├─ channels.service.ts  # Channels + messages API calls

│  │  │  │  ├─ groups.service.ts    # Groups CRUD + members/admins

│  │  │  │  └─ storage.service.ts   # Local storage helper

│  │  │  ├─ app.component.ts

│  │  │  ├─ app.config.ts

│  │  │  ├─ app.html

│  │  │  ├─ app.routes.ts

│  │  │  └─ app.scss

│  │  ├─ index.html

│  │  ├─ main.ts

│  │  └─ styles.scss

│  ├─ .editorconfig

│  ├─ .gitignore

│  ├─ angular.json

│  ├─ package-lock.json

│  ├─ package.json

│  ├─ proxy.conf.json               # Dev proxy (e.g., /api → http://localhost:3000)

│  ├─ tsconfig.app.json

│  ├─ tsconfig.json

│  └─ tsconfig.spec.json

│

├─ server/

│  ├─ node_modules/                 # Installed deps (generated)

│  ├─ src/

│  │  ├─ middleware/

│  │  │  └─ auth.js                 # requireAuth, requireRole, roles

│  │  ├─ routes/

│  │  │  ├─ auth.js                 # /auth/login, /auth/logout

│  │  │  ├─ channels.js             # /channels, /:id/messages, bans

│  │  │  └─ groups.js               # /groups, members/admins

│  │  └─ store.js                   # In-memory Maps + save() → data.json

│  ├─ www/                          # (Optional) Angular build served by Node

│  │  ├─ browser/                   # Built client assets

│  │  ├─ 3rdpartyllicenses.txt

│  │  └─ prerendered-routes.json

│  ├─ package-lock.json

│  ├─ package.json

│  ├─ server.js                     # Express app bootstrap (health, static serve)

│  ├─ .gitignore

│  ├─ data.backup.json              # Backup of persisted data (manual)

│  ├─ data.json                     # Persisted store (users, groups, channels messages)

│  └─ README.md                     # Project documentation (this file)


# Run the server (API)
cd server
npm run dev

# Run the client (Angular)
cd client
npm start 

# Auth & roles
Login: POST /auth/login → { token, sessionToken, user } (both token keys returned for compatibility).

Header: Send Authorization: Bearer <token> 

Logout: POST /auth/logout (deletes token server‑side).

Roles: const roles = { SUPER: 'SUPER', GROUP: 'GROUP_ADMIN', USER: 'USER' };

# API endpoints (Phase 1)
Auth: 

  POST /auth/login { username, password } → { token, sessionToken, user }

  POST /auth/logout → { ok: true }

  Users (protected: SUPER)

  POST /users { username, password, email, roles? } → create user (default role USER).


Groups: 

  GET /groups → list groups

  POST /groups { name } (admin: SUPER/GROUP owner) → create

  POST /groups/:id/members { username } → add member

  POST /groups/:id/admins { username } → add admin


Channels:

  GET /channels/group/:groupId → list channels in group (members or SUPER)

  POST /channels { groupId, name } (GROUP admin or SUPER) → create

  GET /channels/:channelId/messages → last 50 messages (members or SUPER; not banned)
  
  POST /channels/:channelId/messages { text } → send message

  POST /channels/:channelId/ban { username, reason? } (GROUP admin or SUPER) → ban

  DELETE /channels/:channelId/ban/:username (GROUP admin or SUPER) → unban

  DELETE /channels/:channelId (GROUP admin or SUPER) → delete channel



