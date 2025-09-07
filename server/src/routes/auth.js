// auth.js
// this file defines authentication routes for login and logout, managing user sessions
const express = require('express');
const { randomUUID } = require('crypto');
const { users, tokens } = require('../store');

const router = express.Router();

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const foundUser = users.get(username);
  if (!foundUser|| foundUser.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionToken = randomUUID();
  tokens.set(sessionToken, foundUser.username);

  const { password: _pw, ...safeUser } = foundUser; // strip password
  res.json({ token: sessionToken, sessionToken, user: safeUser });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const auth = req.header('authorization');
  const sessionToken = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : req.header('x-token');
  if (sessionToken) tokens.delete(sessionToken);
  res.json({ ok: true });
});

module.exports = router;
