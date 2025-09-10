// server/server.js
// this file sets up the Express server and integrates all route modules
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const groupsRoutes = require('./src/routes/groups');
const channelsRoutes = require('./src/routes/channels');

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'text-video-chat-api', ts: new Date().toISOString() });
});

// Use routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/groups', groupsRoutes);
app.use('/channels', channelsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
