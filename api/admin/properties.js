/**
 * GET    /api/admin/properties       - Admin: All properties (no filter, full data)
 * DELETE /api/admin/properties?id=X  - Admin: Delete a property
 * PATCH  /api/admin/properties?id=X  - Admin: Reset DB to defaults
 */

const db = require('../_lib/db');
const { requireAdmin } = require('../_lib/auth');
const { handleCORS, success, error } = require('../_lib/helpers');
const path = require('path');
const fs = require('fs');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  // ─── GET: All properties list ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const props = db.getProperties();
    const { q, mode } = req.query;
    let filtered = props;

    if (mode) filtered = filtered.filter(p => p.mode === mode);
    if (q) {
      const qLow = q.toLowerCase();
      filtered = filtered.filter(p =>
        (p.title + ' ' + p.developer + ' ' + p.locality + ' ' + (p.rera || '')).toLowerCase().includes(qLow)
      );
    }

    return success(res, { properties: filtered, total: filtered.length });
  }

  // ─── DELETE: Remove property ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return error(res, 'Property ID is required', 400);

    const existing = db.getPropertyById(id);
    if (!existing) return error(res, 'Property not found', 404);

    db.deleteProperty(id);
    return success(res, { message: `"${existing.title}" deleted successfully.` });
  }

  // ─── PATCH: Reset DB to source defaults ───────────────────────────────────
  if (req.method === 'PATCH' && req.query.action === 'reset') {
    const sourcePath = path.join(process.cwd(), 'properties.json');
    if (!fs.existsSync(sourcePath)) {
      return error(res, 'Source properties.json not found', 500);
    }
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    db.saveProperties(sourceData);
    return success(res, {
      message: `Database reset to ${sourceData.length} original properties.`,
      total: sourceData.length
    });
  }

  return error(res, 'Method not allowed', 405);
};

