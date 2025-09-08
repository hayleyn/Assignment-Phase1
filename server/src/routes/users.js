// users.js
// this file defines routes for managing users, including creation, listing, promotion, and deletion
const express = require('express');
const { users } = require('../store');
const { randomUUID } = require('crypto');
const { requireAuth, requireRole, roles } = require('../middleware/auth');

const router = express.Router();

// POST /users
router.post('/', requireAuth, requireRole(roles.GROUP, roles.SUPER), (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (users.has(username)) return res.status(409).json({ error: 'Username exists' });

  const user = { id: randomUUID(), username, email: email || '', password, roles: [roles.USER], groups: [] };
  users.set(username, user);

  res.status(201).json({ id: user.id, username, email: user.email, roles: user.roles, groups: user.groups });
});

// GET /users
router.get('/', requireAuth, requireRole(roles.SUPER), (_req, res) => {
  res.json([...users.values()].map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    roles: u.roles,
    groups: u.groups
  })));
});

// POST /users/:username/promote
router.post('/:username/promote', requireAuth, requireRole(roles.SUPER), (req, res) => {
  const { role } = req.body || {};
  const u = users.get(req.params.username);
  if (!u) return res.status(404).json({ error: 'User not found' });
  if (role && !u.roles.includes(role)) u.roles.push(role);
  res.json({ username: u.username, roles: u.roles });
});

// DELETE /users/:username
router.delete('/:username', requireAuth, (req, res) => {
  const target = users.get(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const isSelf = req.user.username === target.username;
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isSelf && !isSuper) return res.status(403).json({ error: 'Forbidden' });
  users.delete(target.username);
  res.json({ ok: true });
});

module.exports = router;
