/**
 * POST  /api/enquiries       - User: Naya enquiry submit karo
 * GET   /api/enquiries       - Admin: Sabhi enquiries list
 * PATCH /api/enquiries?id=X  - Admin: Status update karo
 * DELETE /api/enquiries?id=X - Admin: Enquiry delete karo
 */

const db = require('../_lib/db');
const { requireAdmin } = require('../_lib/auth');
const { handleCORS, success, error, paginate } = require('../_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  // ─── POST: Submit new enquiry (public endpoint) ───────────────────────────
  if (req.method === 'POST') {
    const { name, email, phone, message, propertyId, propertyTitle, type } = req.body || {};

    if (!name || !name.trim()) return error(res, 'Name is required', 400);
    if (!phone && !email) return error(res, 'Phone or email is required', 400);

    // Simple phone validation
    if (phone && !/^[\d\+\-\s\(\)]{7,15}$/.test(phone.trim())) {
      return error(res, 'Please enter a valid phone number', 400);
    }

    const enquiry = db.saveEnquiry({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      message: message ? message.trim() : '',
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || '',
      type: type || 'General Enquiry',
      source: req.headers['user-agent'] ? 'web' : 'api',
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    });

    return success(res, {
      enquiry: { id: enquiry.id, createdAt: enquiry.createdAt },
      message: 'Thank you! Our team will contact you within 24 hours.'
    }, 201);
  }

  // ─── All routes below require admin ──────────────────────────────────────
  const admin = requireAdmin(req, res);
  if (!admin) return;

  // ─── GET: List all enquiries ──────────────────────────────────────────────
  if (req.method === 'GET') {
    let enquiries = db.getEnquiries();
    const { status, page, limit } = req.query;

    if (status) enquiries = enquiries.filter(e => e.status === status);

    const paginated = paginate(enquiries, page, limit);
    return success(res, {
      enquiries: paginated.items,
      pagination: {
        total: paginated.total,
        page: paginated.page,
        totalPages: paginated.totalPages,
        limit: paginated.limit
      }
    });
  }

  // ─── PATCH: Update enquiry status ─────────────────────────────────────────
  if (req.method === 'PATCH') {
    const id = req.query.id;
    const { status } = req.body || {};

    if (!id) return error(res, 'Enquiry ID is required', 400);
    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return error(res, 'Valid status (new/contacted/closed) is required', 400);
    }

    const updated = db.updateEnquiryStatus(id, status);
    if (!updated) return error(res, 'Enquiry not found', 404);

    return success(res, { enquiry: updated, message: 'Status updated.' });
  }

  // ─── DELETE: Remove enquiry ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return error(res, 'Enquiry ID is required', 400);

    const deleted = db.deleteEnquiry(id);
    if (!deleted) return error(res, 'Enquiry not found', 404);

    return success(res, { message: 'Enquiry deleted.' });
  }

  return error(res, 'Method not allowed', 405);
};
