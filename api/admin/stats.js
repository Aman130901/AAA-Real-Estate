/**
 * GET    /api/admin/stats    - Dashboard stats (total props, leads, etc.)
 */

const db = require('../_lib/db');
const { requireAdmin } = require('../_lib/auth');
const { handleCORS, success, error } = require('../_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') return error(res, 'Method not allowed', 405);

  const props = db.getProperties();
  const enquiries = db.getEnquiries();

  const stats = {
    properties: {
      total: props.length,
      buy: props.filter(p => p.mode === 'buy').length,
      rent: props.filter(p => p.mode === 'rent').length,
      commercial: props.filter(p => p.mode === 'commercial').length
    },
    enquiries: {
      total: enquiries.length,
      new: enquiries.filter(e => e.status === 'new').length,
      contacted: enquiries.filter(e => e.status === 'contacted').length,
      closed: enquiries.filter(e => e.status === 'closed').length
    },
    recentEnquiries: enquiries.slice(0, 5)
  };

  return success(res, { stats });
};

