Assignment Phase 1 Documentation

1. Git Repository Organisation
   
The GitHub repository is structured into two key directories:

client/ → Angular frontend

server/ → Node.js + Express backend

Branching model:

main → final submission branch.

dev → development branch, merged into main upon completion.

feature/ → used when adding new files and features.

fix/ → used when fixing errors.

During development, all work was done under the dev/ branch. Feature and fix sub-branches (e.g., feature/server-scaffold, feature/store-and-roles, fix/add-data-json) were merged into dev/. Finally, dev/ was merged into main/ to provide a complete and stable application.


2. Data Structures
   
Both the server-side and client-side use consistent data structures to represent entities:

Server-side

Users: { id, username, email, password, roles, groups }

Groups: { id, name, ownerUsername, adminUsernames, memberUsernames }

Channel: { id, groupId, name, bannedUsernames[] }

Client-side

User: { id, username, email, roles, groups }

Group: { id, name, ownerUsername, adminUsernames, memberUsernames }

Channel: { id, groupId, name, bannedUsernames[] }

Message: { id, username, text, ts }

Permissions:

SUPER → full permissions (can promote to group admin, remove users, upgrade to SUPER).

GROUP_ADMIN → manage groups, channels, members.

USER → basic chat access.

3. Angular Architecture

Components (client/src/app)

app.component.ts → root component, hosts <router-outlet>.

app.config.ts → application config; sets up routing and HTTP interceptor.

Services (client/src/app/services)

api.service.ts → handles POST /api/auth/login and POST /api/auth/logout.

auth.service.ts → manages authentication state, persistent login, role checks.

channels.service.ts → wraps all channel/message API calls:

listByGroup() → GET /api/channels/group/:groupId

create() → POST /api/channels

getMessages() → GET /api/channels/:channelId/messages

sendMessage() → POST /api/channels/:channelId/messages

deleteChannel() → DELETE /api/channels/:channelId

groups.service.ts → group management:

list() → GET /api/groups

create() → POST /api/groups

addAdmin() → POST /api/groups/:groupId/admins

storage.service.ts → wrapper for localStorage (get, set, remove).

Models (client/src/app/models)

channel.ts → { id, groupId, name, bannedUsernames }

group.ts → { id, name, ownerUsername, adminUsernames, memberUsernames }

message.ts → { id, username, text, ts }

roles.ts → Role = 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'USER'

user.ts → { id, username, email, roles, groups }

Routes

Defined in app.routes.ts:

/login → login.component.ts

/ → dashboard.component.ts

/groups/:id → group-detail.component.ts

/channels/:id → channel-chat.component.ts

Pages (client/src/app/pages)

ChannelChatComponent → send & load messages in a channel.

DashboardComponent → list groups, create groups, logout.

GroupDetailComponent → manage channels and admins within a group.

LoginComponent → user authentication form.

Important Files

Guards → auth.guard.ts, role.guard.ts

Interceptor → auth.interceptor.ts (adds Authorization header)

index.html → root entry file, hosts <app-root>

main.ts → bootstraps app with AppComponent

styles.scss → global styles


5. Node Server Architecture
   
Modules

Middleware (server/src/middleware/auth.js)

requireAuth() → ensures requests have valid tokens.

requireRole() → enforces role-based access.

Route modules (server/src/routes/)

auth.js → /auth/login, /auth/logout

channels.js → manage channels/messages/bans

groups.js → manage groups/members/admins

users.js → manage user accounts

Storage/Data (server/src/store.js)

Loads state from data.json

Keeps Maps in memory (users, groups, channels, messages, tokens, reports)

save() persists changes back to disk

Global Variables (from store.js)

users: Map<username, User>

groups: Map<groupId, Group>

channels: Map<channelId, Channel>

messages: Map<channelId, Message[]>

tokens: Map<sessionToken, username>

reports: Report[]

roles: { SUPER, GROUP, USER }

randomUUID()

7. Server-side Routes
   
Auth.js

Route	Parameters	Return	Purpose

POST /auth/login	Body { username, password }	200 { token, sessionToken, user }	Authenticate user, create session token

POST /auth/logout	Header: Authorization: Bearer <token>	200 { ok: true }	Invalidate session token

Channels.js

Route	Parameters	Return	Purpose

POST /channels	Body { groupId, name }	201 Channel	Create a channel

GET /channels/group/:groupId	Path groupId	200 Channel[]	List channels in a group

GET /channels/:channelId/messages	Path channelId	200 Message[]	Fetch recent messages

POST /channels/:channelId/messages	Path channelId, Body { text }	201 Message	Send a message

DELETE /channels/:channelId	Path channelId	200 { ok: true }	Delete a channel

POST /channels/:channelId/ban	Path channelId, Body { username, reason? }	200 { banned: [...] }	Ban a user

DELETE /channels/:channelId/ban/:username	Path channelId, username	200 { banned: [...] }	Unban a user

GET /channels/reports	—	200 Report[]	Review moderation reports

Groups.js

Route	Parameters	Return	Purpose

POST /groups	Body { name }	201 Group	Create a group

GET /groups	—	200 Group[]	List groups

POST /groups/:groupId/members	Path groupId, Body { username }	200 Group	Add member to group

DELETE /groups/:groupId	Path groupId	200 { ok: true }	Delete a group

POST /groups/:groupId/admins	Path groupId, Body { username }	200 Group	Promote user to admin

DELETE /groups/:groupId/admins/:username	Path groupId, username	200 Group	Remove admin

DELETE /groups/:groupId/members/:username	Path groupId, username	200 Group	Remove member

Users.js

Route	Parameters	Return	Purpose

POST /users	Body { username, password, email? }	201 User	Create a new user

GET /users	—	200 User[]	List all users

POST /users/:username/promote	Path username, Body { role }	200 { username, roles }	Add role to a user

DELETE /users/:username	Path username	200 { ok: true }	Delete a user

9. Client & Server Interaction

Login (/auth/login) → Client posts credentials → Server validates, creates token → Client saves session → Redirects to Dashboard.

Logout (/auth/logout) → Client clears storage → Server deletes token → Redirects to Login.

Dashboard fetch groups (/groups) → Server returns groups (all if SUPER, else membership only) → Client renders groups.

Dashboard create group (/groups) → Server creates new group and updates user → Client adds to group list.

Group detail load channels (/channels/group/:id) → Server returns group channels → Client displays them.

Group detail create channel (/channels) → Server creates channel → Client appends to channel list.

Group detail add admin (/groups/:id/admins) → Server updates admin list → Client refreshes currentGroup.

Channel chat load messages (/channels/:id/messages) → Server returns last 50 → Client updates message list.

Channel chat send message (/channels/:id/messages) → Server saves message → Client appends to messages.

11. Repository Tree Structure
    
Text-Video-Chat-System/

├─ client/

│  ├─ src/app/

│  │  ├─ guards/ (auth.guard.ts, role.guard.ts)

│  │  ├─ interceptors/ (auth.interceptor.ts)

│  │  ├─ models/ (channel.ts, group.ts, message.ts, roles.ts, user.ts)

│  │  ├─ pages/ (channel-chat/, dashboard/, group-detail/, login/)

│  │  ├─ services/ (api.service.ts, auth.service.ts, channels.service.ts, groups.service.ts, storage.service.ts)

│  │  ├─ app.component.ts, app.config.ts, app.routes.ts

│  │  ├─ index.html, main.ts, styles.scss

│  ├─ proxy.conf.json

│  ├─ angular.json, package.json, tsconfig*.json

│

├─ server/

│  ├─ src/

│  │  ├─ middleware/ (auth.js)

│  │  ├─ routes/ (auth.js, channels.js, groups.js, users.js)

│  │  └─ store.js

│  ├─ data.json, data.backup.json

│  ├─ server.js

│  ├─ package.json

│
└─ README.md
