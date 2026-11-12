/**
 * GET  /api/properties       - Sabhi properties list (with filter + pagination)
 * GET  /api/properties?id=X  - Single property by ID
 *
 * Query params:
 *   mode=buy|rent|commercial
 *   q=search term
 *   type=Apartment|Penthouse|Villa|Commercial|Luxury Residence
 *   bhk=2|3|4|5
 *   furn=Semi-furnished|Designer Furnished|Luxury Unfurnished
 *   max=budget (number)
 *   sort=plh|phl|new
 *   page=1
 *   limit=9
 *   id=123 (single property)
 */

const db = require('../_lib/db');
const { handleCORS, success, error, paginate } = require('../_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  if (req.method === 'GET') {
    const { id, mode, q, type, bhk, furn, max, sort, page, limit } = req.query;

    // Single property
    if (id) {
      const prop = db.getPropertyById(id);
      if (!prop) return error(res, 'Property not found', 404);
      return success(res, { property: prop });
    }

    // All properties with optional filters
    let props = db.getProperties();

    if (mode) {
      props = props.filter(p => p.mode === mode);
    }

    if (q) {
      const qLow = q.trim().toLowerCase();
      props = props.filter(p =>
        (p.city + ' ' + p.locality + ' ' + p.pin + ' ' + p.title + ' ' + p.developer + ' ' + (p.rera || ''))
          .toLowerCase().includes(qLow)
      );
    }

    if (type) {
      props = props.filter(p => p.type === type);
    }

    if (bhk) {
      const bhkNum = parseInt(bhk);
      if (bhkNum >= 5) props = props.filter(p => p.bhk >= 5);
      else if (bhkNum === 4) props = props.filter(p => p.bhk === 4);
      else props = props.filter(p => p.bhk === bhkNum);
    }

    if (furn) {
      props = props.filter(p => p.furn === furn);
    }

    if (max) {
      const maxNum = parseFloat(max);
      if (!isNaN(maxNum)) {
        props = props.filter(p => p.price <= maxNum);
      }
    }

    // Sorting
    if (sort === 'plh') props.sort((a, b) => a.price - b.price);
    else if (sort === 'phl') props.sort((a, b) => b.price - a.price);
    else if (sort === 'new') props.sort((a, b) => a.added - b.added);

    const paginated = paginate(props, page, limit);

    return success(res, {
      properties: paginated.items,
      pagination: {
        total: paginated.total,
        page: paginated.page,
        totalPages: paginated.totalPages,
        limit: paginated.limit
      }
    });
  }

  return error(res, 'Method not allowed', 405);
};
