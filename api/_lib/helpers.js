/**
 * AAA Real Estate - CORS & Response Helpers
 */

const ALLOWED_ORIGINS = [
  'http://localhost:8000',
  'http://localhost:3000',
  'http://127.0.0.1:8000',
  'https://aaa-real-estate.vercel.app',
  // Add your custom domain here
];

function setCORS(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function handleCORS(req, res) {
  setCORS(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // preflight handled
  }
  return false; // continue processing
}

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, ...data });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

function paginate(array, page = 1, limit = 9) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 9));
  const total = array.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const items = array.slice(start, start + limitNum);
  return { items, total, page: pageNum, totalPages, limit: limitNum };
}

module.exports = { setCORS, handleCORS, success, error, paginate };

