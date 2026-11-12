/**
 * POST  /api/admin/login   - Admin login → JWT token milta hai
 * GET   /api/admin/login   - Token verify karo (health check)
 */

const { generateToken, validateAdminCredentials, requireAdmin } = require('../_lib/auth');
const { handleCORS, success, error } = require('../_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  // ─── GET: Verify token ────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return success(res, {
      admin: { email: admin.email, role: admin.role },
      message: 'Token is valid'
    });
  }

  // ─── POST: Login ──────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    if (!validateAdminCredentials(email.trim().toLowerCase(), password)) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken({ email: email.trim().toLowerCase(), role: 'admin' });

    return success(res, {
      token,
      admin: { email: email.trim().toLowerCase(), role: 'admin' },
      expiresIn: '24h',
      message: 'Login successful! Welcome, Admin.'
    });
  }

  return error(res, 'Method not allowed', 405);
};

