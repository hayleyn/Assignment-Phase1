// groups.js
// this file defines routes for managing groups, including creation, membership, and admin roles
const express = require('express');
const { groups, channels, users } = require('../store');
const { randomUUID } = require('crypto');
const { requireAuth, requireRole, roles } = require('../middleware/auth');

const router = express.Router();

// POST /groups
router.post('/', requireAuth, requireRole(roles.GROUP, roles.SUPER), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  const id = randomUUID();
  groups.set(id, {
    id,
    name,
    ownerUsername: req.user.username,
    adminUsernames: [req.user.username],
    memberUsernames: [req.user.username],
  });

  const u = users.get(req.user.username);
  u.groups.push(id);

  res.status(201).json(groups.get(id));
});

// GET /groups
router.get('/', requireAuth, (req, res) => {
  const isSuper = req.user.roles.includes(roles.SUPER);
  const list = [...groups.values()].filter(
    group => isSuper || group.memberUsernames.includes(req.user.username)
  );
  res.json(list);
});

// POST /groups/:groupId/members
router.post('/:groupId/members', requireAuth, (req, res) => {
  const { username } = req.body || {};
  const group = groups.get(req.params.groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isSuper = req.user.roles.includes(roles.SUPER);
  const isGroupAdmin = group.adminUsernames.includes(req.user.username);
  if (!isSuper && !isGroupAdmin) return res.status(403).json({ error: 'Forbidden' });
  if (!users.has(username)) return res.status(404).json({ error: 'User not found' });
  if (!group.memberUsernames.includes(username)) group.memberUsernames.push(username);
  const u = users.get(username);
  if (!u.groups.includes(group.id)) u.groups.push(group.id);
  res.json(group);
});

// DELETE /groups/:groupId
router.delete('/:groupId', requireAuth, (req, res) => {
  const group = groups.get(req.params.groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isOwner = group.ownerUsername === req.user.username;
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isOwner && !isSuper) return res.status(403).json({ error: 'Only owner or super can delete' });
  for (const [cid, ch] of channels.entries()) if (ch.groupId === group.id) channels.delete(cid);
  groups.delete(group.id);
  res.json({ ok: true });
});

// POST /groups/:groupId/admins
router.post('/:groupId/admins', requireAuth, (req, res) => {
    const { username } = req.body || {};
    const group = groups.get(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!username) return res.status(400).json({ error: 'username required' });
  
    const isOwner = group.ownerUsername === req.user.username;
    const isSuper = req.user.roles.includes(roles.SUPER);
    if (!isOwner && !isSuper) return res.status(403).json({ error: 'Only owner or super' });
    if (!users.has(username)) return res.status(404).json({ error: 'User not found' });
    if (!group.memberUsernames.includes(username)) group.memberUsernames.push(username);
    const u = users.get(username);
    if (!u.groups.includes(group.id)) u.groups.push(group.id);
    if (!group.adminUsernames.includes(username)) group.adminUsernames.push(username);
    res.json(group);
  });

  // DELETE /groups/:groupId/admins/:username
  router.delete('/:groupId/admins/:username', requireAuth, (req, res) => {
    const group = groups.get(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
  
    const isOwner = group.ownerUsername === req.user.username;
    const isSuper = req.user.roles.includes(roles.SUPER);
    if (!isOwner && !isSuper) return res.status(403).json({ error: 'Only owner or super' });
  
    group.adminUsernames = group.adminUsernames.filter(u => u !== req.params.username);
    res.json(group);
  });

  // DELETE /groups/:groupId/members/:username
  router.delete('/:groupId/members/:username', requireAuth, (req, res) => {
    const group = groups.get(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const target = users.get(req.params.username);
    if (!target) return res.status(404).json({ error: 'User not found' });
  
    const isGroupAdmin = group.adminUsernames.includes(req.user.username);
    const isSuper = req.user.roles.includes(roles.SUPER);
    if (!isGroupAdmin && !isSuper) return res.status(403).json({ error: 'Forbidden' });
  
    // prevent removing the owner unless super
    if (group.ownerUsername === target.username && !isSuper) {
      return res.status(403).json({ error: 'Only super can remove the owner' });
    }
  
    group.memberUsernames = group.memberUsernames.filter(u => u !== target.username);
    target.groups = (target.groups || []).filter(id => id !== group.id);
    group.adminUsernames = group.adminUsernames.filter(u => u !== target.username);
  
    res.json(group);
  });

module.exports = router;
