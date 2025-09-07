// server/src/store.js
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// Define user roles
const roles = {
    SUPER: 'SUPER',
    GROUP: 'GROUP_ADMIN',
    USER: 'USER',
  };

const DATA_FILE = path.join(__dirname, '..', '..', 'data.json');

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const json = JSON.parse(raw || '{}');
    return {
      users: Array.isArray(json.users) ? json.users : [],
      groups: Array.isArray(json.groups) ? json.groups : [],
      channels: Array.isArray(json.channels) ? json.channels : [],
      messages: (json.messages && !Array.isArray(json.messages)) ? json.messages : {},
      reports: Array.isArray(json.reports) ? json.reports : [],
    };
  } catch {
    return {
      users: [
        { id: randomUUID(), username: 'super', email: 'super@example.com', password: '123', roles: ['roles.SUPER'], groups: [] }
      ],
      groups: [],
      channels: [],
      messages: {},
      reports: [],
    };
  }
}
const initial = load();

const users = new Map(initial.users.map(u => [u.username, u])); // key by username
const groups = new Map(initial.groups.map(g => [g.id, g]));
const channels = new Map(initial.channels.map(c => [c.id, c]));
const messages = new Map(Object.entries(initial.messages)); // entries of { [channelId]: [] }
const reports = initial.reports;

const tokens = new Map();

// Save current state to data.json
function save() {
  const out = {
    users: [...users.values()],
    groups: [...groups.values()],
    channels: [...channels.values()],
    messages: Object.fromEntries([...messages.entries()]),
    reports,
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 2), 'utf8');
}

// Export the in-memory stores and save function
module.exports = {
  users,
  groups,
  channels,
  messages,
  tokens,
  reports,
  save,
  randomUUID, 
  roles,
};
