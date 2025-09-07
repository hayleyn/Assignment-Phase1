// channels.js
// this file defines routes for managing channels, messages, and user bans within groups
const express = require('express');
const { channels, groups, messages, users, reports, save } = require('../store');
const { randomUUID } = require('crypto');
const { requireAuth, requireRole, roles } = require('../middleware/auth');

const router = express.Router();

// POST /channels  (create channel)
router.post('/', requireAuth, requireRole(roles.GROUP, roles.SUPER), (req, res) => {
  const { groupId, name } = req.body || {};
  const group = groups.get(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const isGroupAdmin = group.adminUsernames.includes(req.user.username);
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isGroupAdmin && !isSuper) return res.status(403).json({ error: 'Forbidden' });

  const id = randomUUID();
  channels.set(id, { id, groupId, name, bannedUsernames: [] });
  messages.set(id, []);
  save();
  return res.status(201).json(channels.get(id));
});

// GET /channels/group/:groupId  (list channels in group)
router.get('/group/:groupId', requireAuth, (req, res) => {
  const group = groups.get(req.params.groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const canView = group.memberUsernames.includes(req.user.username) || req.user.roles.includes(roles.SUPER);
  if (!canView) return res.status(403).json({ error: 'Forbidden' });
  return res.json([...channels.values()].filter(c => c.groupId === group.id));
});

// GET /channels/:channelId/messages  (last 50)
router.get('/:channelId/messages', requireAuth, (req, res) => {
  const channel = channels.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const group = groups.get(channel.groupId);
  const canView = group.memberUsernames.includes(req.user.username) || req.user.roles.includes(roles.SUPER);
  if (!canView) return res.status(403).json({ error: 'Forbidden' });

  const isBanned = (channel.bannedUsernames || []).includes(req.user.username);
  if (isBanned) return res.status(403).json({ error: 'Banned from this channel' });

  const history = messages.get(channel.id) || [];
  return res.json(history.slice(-50));
});

// POST /channels/:channelId/messages  (send message)
router.post('/:channelId/messages', requireAuth, (req, res) => {
  const channel = channels.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const group = groups.get(channel.groupId);
  const canView = group.memberUsernames.includes(req.user.username) || req.user.roles.includes(roles.SUPER);
  if (!canView) return res.status(403).json({ error: 'Forbidden' });

  const isBanned = (channel.bannedUsernames || []).includes(req.user.username);
  if (isBanned) return res.status(403).json({ error: 'Banned from this channel' });

  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });

  const message = { id: randomUUID(), username: req.user.username, text: text.trim(), ts: Date.now() };
  const thread = messages.get(channel.id) || [];
  thread.push(message);
  messages.set(channel.id, thread);
  save();
  return res.status(201).json(message);
});

// DELETE /channels/:channelId  (delete channel)
router.delete('/:channelId', requireAuth, (req, res) => {
  const channel = channels.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const group = groups.get(channel.groupId);
  const isGroupAdmin = group.adminUsernames.includes(req.user.username);
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isGroupAdmin && !isSuper) return res.status(403).json({ error: 'Forbidden' });

  channels.delete(channel.id);
  messages.delete(channel.id);
  save();
  return res.json({ ok: true });
});

// POST /channels/:channelId/ban  (ban a user)
router.post('/:channelId/ban', requireAuth, (req, res) => {
  const { username, reason } = req.body || {};
  const channel = channels.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const group = groups.get(channel.groupId);
  const isGroupAdmin = group.adminUsernames.includes(req.user.username);
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isGroupAdmin && !isSuper) return res.status(403).json({ error: 'Forbidden' });

  if (!users.has(username)) return res.status(404).json({ error: 'User not found' });

  channel.bannedUsernames = channel.bannedUsernames || [];
  if (!channel.bannedUsernames.includes(username)) channel.bannedUsernames.push(username);
  channels.set(channel.id, channel);
  reports.push({
    id: randomUUID(),
    type: 'BAN',
    channelId: channel.id,
    groupId: group.id,
    by: req.user.username,
    against: username,
    reason: reason || 'policy violation',
    ts: Date.now()
  });

  save();
  return res.json({ banned: channel.bannedUsernames });
});

// DELETE /channels/:channelId/ban/:username  (unban)
router.delete('/:channelId/ban/:username', requireAuth, (req, res) => {
  const channel = channels.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const group = groups.get(channel.groupId);
  const isGroupAdmin = group.adminUsernames.includes(req.user.username);
  const isSuper = req.user.roles.includes(roles.SUPER);
  if (!isGroupAdmin && !isSuper) return res.status(403).json({ error: 'Forbidden' });

  channel.bannedUsernames = (channel.bannedUsernames || []).filter(u => u !== req.params.username);
  channels.set(channel.id, channel);
  save();
  return res.json({ banned: channel.bannedUsernames });
});

// GET /channels/reports  (supers review reports)
router.get('/reports', requireAuth, requireRole(roles.SUPER), (_req, res) => {
  return res.json(reports);
});

module.exports = router;
