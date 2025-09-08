// auth.js
// Middleware for authentication and role-based access control
const { tokens, users } = require('../store');

const roles = {
  SUPER: 'SUPER',
  GROUP: 'GROUP_ADMIN',
  USER: 'USER',
};

// Middleware to require authentication
function requireAuth(req, res, next) {
  const auth = req.header('authorization');
  const token = auth?.startsWith('Bearer ')
    ? auth.slice(7).trim()
    : req.header('x-token');

  if (!token) return res.status(401).json({ error: 'Unauthenticated' });

  const username = tokens.get(token);
  if (!username) return res.status(401).json({ error: 'Unauthenticated' });

  const user = users.get(username);
  if (!user) return res.status(401).json({ error: 'Unauthenticated' });

  req.user = user;
  next();
}

// Middleware to require one of the specified roles
function requireRole(...anyRoles) {
  return (req, res, next) => {
    const allowed = (req.user?.roles || []).some(r => anyRoles.includes(r));
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole, roles };
