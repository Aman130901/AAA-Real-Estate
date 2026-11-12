/**
 * AAA Real Estate - Auth Middleware
 * JWT-based admin authentication
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aaa_realestate_super_secret_key_2026';
const JWT_EXPIRES = '24h';

// Admin credentials (in production, store hashed in env vars)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aaarealestate.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function extractToken(req) {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // Also check cookie or query param
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

function requireAdmin(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. Please sign in as Admin.' });
    return null;
  }
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
    return null;
  }
  return decoded;
}

function validateAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  requireAdmin,
  validateAdminCredentials,
  JWT_SECRET
};

