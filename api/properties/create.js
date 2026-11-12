/**
 * POST  /api/properties/create   - Admin: Naya property add karo
 * PUT   /api/properties/create   - Admin: Property update karo (body mein id chahiye)
 * DELETE /api/properties/create  - Admin: Property delete karo (?id=X)
 */

const db = require('../_lib/db');
const { requireAdmin } = require('../_lib/auth');
const { handleCORS, success, error } = require('../_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  // ─── POST: Create new property ────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body;
    if (!body) return error(res, 'Request body required', 400);

    const { title, developer, mode, type, city, locality, price, bhk, carpet } = body;

    // Basic validation
    if (!title || !title.trim()) return error(res, 'Property title is required', 400);
    if (!developer || !developer.trim()) return error(res, 'Developer name is required', 400);
    if (!mode || !['buy', 'rent', 'commercial'].includes(mode)) return error(res, 'Valid mode (buy/rent/commercial) is required', 400);
    if (!locality || !locality.trim()) return error(res, 'Locality is required', 400);

    const propData = {
      title: title.trim(),
      developer: developer.trim(),
      mode,
      type: type || 'Apartment',
      city: city || 'Mumbai',
      locality: locality.trim(),
      pin: body.pin || '400018',
      bhk: parseInt(bhk) || 3,
      bath: parseInt(body.bath) || Math.max(2, parseInt(bhk) || 3),
      carpet: parseInt(carpet) || 1200,
      price: parseFloat(price) || 10000000,
      priceStr: body.priceStr || '',
      psf: body.psf || '',
      furn: body.furn || 'Semi-furnished',
      poss: body.poss || 'On request',
      status: body.status || 'Under construction',
      img: body.img || 'assets/rec-1.jpg',
      images: body.images || [body.img || 'assets/rec-1.jpg'],
      amen: body.amen || ['Sea View', 'Infinity Pool', 'Clubhouse', 'Private Elevator', '24x7 Security', 'Gym'],
      rera: body.rera || 'Verify on MahaRERA',
      floors: body.floors || '',
      notes: body.notes || '',
      config: body.config || (parseInt(bhk) ? parseInt(bhk) + ' BHK' : type || 'Apartment')
    };

    const newProp = db.createProperty(propData);
    return success(res, { property: newProp, message: 'Property listed successfully!' }, 201);
  }

  // ─── PUT: Update existing property ───────────────────────────────────────
  if (req.method === 'PUT') {
    const body = req.body;
    if (!body || !body.id) return error(res, 'Property ID is required for update', 400);

    const existing = db.getPropertyById(body.id);
    if (!existing) return error(res, 'Property not found', 404);

    const updates = { ...body };
    delete updates.id; // ID nahi badlega

    // Parse numeric fields
    if (updates.bhk !== undefined) updates.bhk = parseInt(updates.bhk);
    if (updates.bath !== undefined) updates.bath = parseInt(updates.bath);
    if (updates.carpet !== undefined) updates.carpet = parseInt(updates.carpet);
    if (updates.price !== undefined) updates.price = parseFloat(updates.price);

    // Ensure images array consistency
    if (updates.img && (!updates.images || !updates.images.length)) {
      updates.images = [updates.img];
    } else if (updates.images && updates.images.length && !updates.img) {
      updates.img = updates.images[0];
    }

    const updated = db.updateProperty(body.id, updates);
    return success(res, { property: updated, message: 'Property updated successfully!' });
  }

  // ─── DELETE: Remove property ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id);
    if (!id) return error(res, 'Property ID is required', 400);

    const existing = db.getPropertyById(id);
    if (!existing) return error(res, 'Property not found', 404);

    db.deleteProperty(id);
    return success(res, { message: `Property "${existing.title}" deleted successfully.` });
  }

  return error(res, 'Method not allowed', 405);
};

